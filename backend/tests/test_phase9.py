"""Phase 9 tests — Gift card preview / IBAN+gift checkout / regression."""
import os
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tuncel-textile.preview.emergentagent.com").rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

GC_CODE = "TEST-GC-100"


@pytest.fixture(scope="module")
def db():
    cli = MongoClient(MONGO_URL)
    yield cli[DB_NAME]
    cli.close()


@pytest.fixture(autouse=True)
def reset_gift_card(db):
    """Reset TEST-GC-100 to active/100 before each test so balance is deterministic."""
    db.gift_cards.update_one(
        {"code": GC_CODE},
        {"$set": {"balance": 100.0, "status": "active", "redemptions": []}},
    )
    yield


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def first_product(api):
    r = api.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200, r.text
    products = r.json()
    assert len(products) > 0
    return products[0]


# ---------- GIFT CARD PREVIEW ----------
class TestGiftCardPreview:
    def test_preview_partial_coverage(self, api):
        # cart 89, balance 100 → discount 89, new_total 0, remaining 11
        r = api.post(f"{BASE_URL}/api/gift-cards/preview", json={"code": GC_CODE, "cart_total": 89})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["code"] == GC_CODE
        assert abs(d["discount"] - 89.0) < 0.01, d
        assert abs(d["new_total"] - 0.0) < 0.01, d
        assert abs(d["remaining_balance"] - 11.0) < 0.01, d
        assert d["currency"] == "eur"

    def test_preview_full_coverage_above_balance(self, api):
        # cart 250, balance 100 → discount 100, new_total 150
        r = api.post(f"{BASE_URL}/api/gift-cards/preview", json={"code": GC_CODE, "cart_total": 250})
        assert r.status_code == 200
        d = r.json()
        assert abs(d["discount"] - 100.0) < 0.01
        assert abs(d["new_total"] - 150.0) < 0.01
        assert abs(d["remaining_balance"] - 0.0) < 0.01

    def test_preview_invalid_code_400(self, api):
        r = api.post(f"{BASE_URL}/api/gift-cards/preview", json={"code": "NOPE-NOPE", "cart_total": 50})
        assert r.status_code == 400, r.text

    def test_preview_empty_code_400(self, api):
        # empty string code → backend should treat as missing/invalid
        r = api.post(f"{BASE_URL}/api/gift-cards/preview", json={"code": "", "cart_total": 50})
        # _apply_gift_card returns (0,total,None) when code falsy; preview returns code=None
        # Either 200-with-code:None or 400 is acceptable behaviour; we accept both but assert no discount
        assert r.status_code in (200, 400, 422)
        if r.status_code == 200:
            assert r.json().get("discount", 0) == 0


# ---------- GIFT CARD VALIDATE ----------
class TestGiftCardValidate:
    def test_validate_active_card(self, api):
        r = api.get(f"{BASE_URL}/api/gift-cards/validate/{GC_CODE}")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["code"] == GC_CODE
        assert d["balance"] == 100.0
        assert d["status"] == "active"
        assert d["currency"] == "eur"

    def test_validate_unknown_code_404(self, api):
        r = api.get(f"{BASE_URL}/api/gift-cards/validate/UNKNOWN-CODE-X")
        assert r.status_code == 404


# ---------- IBAN CHECKOUT WITH GIFT CARD ----------
class TestIbanCheckoutWithGift:
    def test_iban_fully_paid_by_gift(self, api, first_product, db):
        """Cart < gift card balance → fully paid by gift, no IBAN transfer."""
        # ensure cart total <= 100
        unit_price = float(first_product["price"])
        qty = max(1, int(99 // unit_price)) or 1
        items = [{"product_id": first_product["id"], "quantity": qty}]
        cart_total = round(unit_price * qty, 2)
        assert cart_total <= 100, f"product too expensive for full-coverage test: {cart_total}"

        payload = {
            "items": items,
            "customer_email": "TEST_p9_full@example.com",
            "customer_name": "TEST P9 Full",
            "gift_card_code": GC_CODE,
        }
        r = api.post(f"{BASE_URL}/api/checkout/iban", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["fully_paid_by_gift"] is True, d
        assert abs(d["amount"] - 0.0) < 0.01, d
        assert abs(d["amount_original"] - cart_total) < 0.01
        assert abs(d["gift_card_discount"] - cart_total) < 0.01
        ref = d["reference"]

        # Verify order in DB
        tx = db.payment_transactions.find_one({"reference": ref})
        assert tx is not None
        assert tx["payment_status"] == "paid"
        assert tx["payment_method"] == "gift_card"
        assert tx["status"] == "complete"
        assert tx["gift_card_code"] == GC_CODE
        assert tx["gift_card_consumed"] is True

        # Verify gift card balance deducted
        gc = db.gift_cards.find_one({"code": GC_CODE})
        expected_balance = round(100.0 - cart_total, 2)
        assert abs(gc["balance"] - expected_balance) < 0.01
        if expected_balance <= 0.005:
            assert gc["status"] == "redeemed"
        else:
            assert gc["status"] == "partially_used"
        assert len(gc["redemptions"]) >= 1
        assert gc["redemptions"][-1]["order_ref"] == ref
        assert abs(gc["redemptions"][-1]["amount"] - cart_total) < 0.01

        # Cleanup
        db.payment_transactions.delete_one({"reference": ref})

    def test_iban_partial_gift_still_awaiting(self, api, first_product, db):
        """Cart >> gift balance → partial discount, still awaiting bank transfer."""
        unit_price = float(first_product["price"])
        qty = max(1, int(200 // unit_price) + 1)
        items = [{"product_id": first_product["id"], "quantity": qty}]
        cart_total = round(unit_price * qty, 2)
        assert cart_total > 100

        payload = {
            "items": items,
            "customer_email": "TEST_p9_partial@example.com",
            "customer_name": "TEST P9 Partial",
            "gift_card_code": GC_CODE,
        }
        r = api.post(f"{BASE_URL}/api/checkout/iban", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["fully_paid_by_gift"] is False
        assert abs(d["gift_card_discount"] - 100.0) < 0.01
        assert abs(d["amount"] - (cart_total - 100.0)) < 0.01
        ref = d["reference"]
        tx = db.payment_transactions.find_one({"reference": ref})
        assert tx["payment_status"] == "awaiting_bank_transfer"
        assert tx["payment_method"] == "iban"
        # Partial-payment flow does NOT consume gift card until invoice confirmed
        assert tx.get("gift_card_consumed") is False
        # Gift card still has original balance because partial flow consumes on payment confirm
        gc = db.gift_cards.find_one({"code": GC_CODE})
        assert gc["balance"] == 100.0
        db.payment_transactions.delete_one({"reference": ref})

    def test_iban_no_gift_card_regression(self, api, first_product, db):
        """Existing IBAN flow without gift card still works."""
        items = [{"product_id": first_product["id"], "quantity": 1}]
        payload = {
            "items": items,
            "customer_email": "TEST_p9_nogc@example.com",
            "customer_name": "TEST P9 NoGC",
        }
        r = api.post(f"{BASE_URL}/api/checkout/iban", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("fully_paid_by_gift") is False
        assert d["amount"] > 0
        assert d["gift_card_discount"] == 0
        tx = db.payment_transactions.find_one({"reference": d["reference"]})
        assert tx["payment_status"] == "awaiting_bank_transfer"
        db.payment_transactions.delete_one({"reference": d["reference"]})


# ---------- REGRESSION OF EXISTING ENDPOINTS ----------
class TestRegression:
    def test_get_products(self, api):
        r = api.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) > 0

    def test_get_hero(self, api):
        r = api.get(f"{BASE_URL}/api/hero")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_cms(self, api):
        r = api.get(f"{BASE_URL}/api/cms")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_get_settings(self, api):
        r = api.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict)

    def test_order_lookup_missing(self, api):
        # order-lookup with bogus credentials should respond gracefully (400/404), not 500
        r = api.post(
            f"{BASE_URL}/api/order-lookup",
            json={"reference": "TT-NOPE99", "email": "nobody@example.com"},
        )
        assert r.status_code in (400, 404, 422)

    def test_returns_submit(self, api, first_product, db):
        # create an IBAN order then submit a return request
        items = [{"product_id": first_product["id"], "quantity": 1}]
        r = api.post(
            f"{BASE_URL}/api/checkout/iban",
            json={"items": items, "customer_email": "TEST_p9_ret@example.com", "customer_name": "TEST Ret"},
        )
        assert r.status_code == 200
        ref = r.json()["reference"]
        # mark paid so return is allowed
        db.payment_transactions.update_one({"reference": ref}, {"$set": {"payment_status": "paid"}})

        r2 = api.post(
            f"{BASE_URL}/api/returns",
            json={
                "order_reference": ref,
                "email": "TEST_p9_ret@example.com",
                "reason": "size_too_big",
                "details": "Too big",
                "return_type": "refund",
                "description": "Too big, want refund",
            },
        )
        assert r2.status_code in (200, 201), r2.text
        db.payment_transactions.delete_one({"reference": ref})

    def test_custom_request(self, api):
        r = api.post(
            f"{BASE_URL}/api/custom-requests",
            json={
                "customer_name": "TEST P9 Custom",
                "customer_email": "TEST_p9_custom@example.com",
                "email": "TEST_p9_custom@example.com",
                "description": "Custom hoodie request",
                "idea_description": "Custom hoodie request",
                "garment_type": "hoodie",
                "product_type": "hoodie",
                "color": "black",
                "size": "M",
            },
        )
        assert r.status_code in (200, 201), r.text

    def test_chat_start(self, api):
        r = api.post(
            f"{BASE_URL}/api/chat/start",
            json={"buyer_name": "TEST P9 Chat", "buyer_email": "TEST_p9_chat@example.com"},
        )
        assert r.status_code in (200, 201), r.text
        d = r.json()
        assert "session_id" in d or "id" in d
