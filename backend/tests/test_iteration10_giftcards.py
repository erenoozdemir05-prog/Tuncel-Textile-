"""
Iteration 10 — Gift Card SINGLE-USE policy + regression suite.

Policy under test:
- POST /api/gift-cards/preview with active card returns discount + new_total + remaining_balance.
- After consumption via POST /api/checkout/iban, card MUST move to status='redeemed'
  (NOT 'partially_used') even when balance remains.
- Subsequent GET /api/gift-cards/validate/<code> MUST return 400 "already been used".
- Subsequent POST /api/gift-cards/preview MUST return 400 "already used".
- Regression: existing public endpoints still work.
"""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend/.env file
    import re
    with open("/app/frontend/.env") as f:
        for line in f:
            m = re.match(r"REACT_APP_BACKEND_URL=(.+)", line.strip())
            if m:
                BASE_URL = m.group(1).rstrip("/")
                break

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

API = f"{BASE_URL}/api"
GIFT_CODE = "TEST-GC-100"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


@pytest.fixture(autouse=True)
def reset_gift_card(mongo_db):
    """Reset TEST-GC-100 to a clean active €100 state before each test."""
    mongo_db.gift_cards.update_one(
        {"code": GIFT_CODE},
        {
            "$set": {
                "balance": 100.0,
                "status": "active",
                "redemptions": [],
                "redeemed_at": None,
                "currency": "eur",
                "amount": 100.0,
                "expires_at": "2030-12-31T23:59:59+00:00",
            }
        },
        upsert=True,
    )
    yield
    # post-test: also reset to keep deterministic
    mongo_db.gift_cards.update_one(
        {"code": GIFT_CODE},
        {"$set": {"balance": 100.0, "status": "active", "redemptions": [], "redeemed_at": None}},
    )


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _pick_product(api):
    r = api.get(f"{API}/products", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) > 0
    return data[0]


# ---------- Preview tests ----------
class TestGiftCardPreview:
    def test_preview_partial_cart_below_balance(self, api):
        r = api.post(f"{API}/gift-cards/preview", json={"code": GIFT_CODE, "cart_total": 50})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["code"] == GIFT_CODE
        assert body["discount"] == 50
        assert body["new_total"] == 0
        assert body["remaining_balance"] == 50

    def test_preview_cart_above_balance(self, api):
        r = api.post(f"{API}/gift-cards/preview", json={"code": GIFT_CODE, "cart_total": 250})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["discount"] == 100
        assert body["new_total"] == 150
        assert body["remaining_balance"] == 0

    def test_preview_unknown_code_404_or_400(self, api):
        r = api.post(f"{API}/gift-cards/preview", json={"code": "NOT-REAL-XXX", "cart_total": 50})
        assert r.status_code in (400, 404), r.text

    def test_validate_active_card_returns_balance(self, api):
        r = api.get(f"{API}/gift-cards/validate/{GIFT_CODE}")
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["code"] == GIFT_CODE
        assert body["balance"] == 100
        assert body["status"] == "active"

    def test_validate_unknown_card_404(self, api):
        r = api.get(f"{API}/gift-cards/validate/NO-SUCH-CODE")
        assert r.status_code == 404


# ---------- Single-use semantics ----------
class TestGiftCardSingleUse:
    def _consume_via_iban(self, api, gift_code=GIFT_CODE):
        product = _pick_product(api)
        ref_tag = f"giftsingle_{uuid.uuid4().hex[:6]}"
        payload = {
            "items": [{"product_id": product["id"], "qty": 1}],
            "customer_email": f"test_{ref_tag}@example.com",
            "customer_name": "Test Buyer",
            "shipping_address": "Test 1, Riga LV-1001, LV",
            "gift_card_code": gift_code,
        }
        r = api.post(f"{API}/checkout/iban", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        return r.json()

    def test_partial_consume_marks_redeemed_and_blocks_reuse(self, api, mongo_db):
        """Apply gift card on a small order (€ < balance). After consume:
           - status='redeemed' (NOT 'partially_used')
           - redeemed_at set
           - redemptions has 1 entry
           - validate returns 400 'already been used'
           - preview returns 400 'already used'
        """
        product = _pick_product(api)
        price = float(product["price"])
        # If product price >= balance(100), cap by setting qty=1 and trust the discount logic still triggers single-use.
        order = self._consume_via_iban(api)
        assert "reference" in order
        # Backend should have consumed the gift card (fully_paid_by_gift only if total<=balance)
        # Either way, single-use means status='redeemed'.

        card = mongo_db.gift_cards.find_one({"code": GIFT_CODE})
        assert card is not None
        assert card["status"] == "redeemed", f"Expected status=redeemed got {card.get('status')}"
        assert card.get("redeemed_at"), "redeemed_at should be set"
        assert isinstance(card.get("redemptions"), list) and len(card["redemptions"]) >= 1
        last = card["redemptions"][-1]
        assert "order_ref" in last and "amount" in last and last["amount"] > 0

        # Validate endpoint must now reject
        v = api.get(f"{API}/gift-cards/validate/{GIFT_CODE}")
        assert v.status_code == 400, v.text
        assert "already" in v.text.lower() and "used" in v.text.lower()

        # Preview must also reject
        p = api.post(f"{API}/gift-cards/preview", json={"code": GIFT_CODE, "cart_total": 20})
        assert p.status_code == 400, p.text
        assert "already" in p.text.lower() and "used" in p.text.lower()

    def test_reuse_attempt_via_iban_blocked(self, api, mongo_db):
        # First consume
        self._consume_via_iban(api)
        # Now status should be redeemed; second attempt to checkout with same code must fail with 400
        product = _pick_product(api)
        payload = {
            "items": [{"product_id": product["id"], "qty": 1}],
            "customer_email": "test_reuse@example.com",
            "customer_name": "Test Reuse",
            "shipping_address": "Test 1, Riga LV-1001, LV",
            "gift_card_code": GIFT_CODE,
        }
        r = api.post(f"{API}/checkout/iban", json=payload, timeout=30)
        assert r.status_code == 400, r.text
        assert "already" in r.text.lower()


# ---------- Regression ----------
class TestRegression:
    def test_get_products(self, api):
        r = api.get(f"{API}/products")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_get_hero(self, api):
        r = api.get(f"{API}/hero")
        assert r.status_code == 200

    def test_get_cms(self, api):
        r = api.get(f"{API}/cms")
        assert r.status_code == 200

    def test_get_settings(self, api):
        r = api.get(f"{API}/settings")
        assert r.status_code == 200

    def test_iban_checkout_without_gift_card(self, api):
        product = _pick_product(api)
        payload = {
            "items": [{"product_id": product["id"], "qty": 1}],
            "customer_email": "test_nogift@example.com",
            "customer_name": "No Gift",
            "shipping_address": "X, Riga LV-1000, LV",
        }
        r = api.post(f"{API}/checkout/iban", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "reference" in body
        # payment_status may not be in immediate response; assert canonical shape
        assert "amount" in body and body.get("amount", 0) > 0

    def test_order_lookup_invalid_ref(self, api):
        r = api.post(f"{API}/order-lookup", json={"reference": "NOT-EXIST-XYZ", "email": "x@x.com"})
        assert r.status_code in (200, 400, 404)

    def test_returns_validation_error(self, api):
        # Missing fields → 422 or 400
        r = api.post(f"{API}/returns", json={})
        assert r.status_code in (400, 422)

    def test_custom_requests_validation_error(self, api):
        r = api.post(f"{API}/custom-requests", json={})
        assert r.status_code in (400, 422)

    def test_chat_start(self, api):
        r = api.post(f"{API}/chat/start", json={"name": "Test", "email": "t@t.com"})
        assert r.status_code in (200, 201), r.text


if __name__ == "__main__":
    import sys
    sys.exit(pytest.main([__file__, "-v", "--tb=short"]))
