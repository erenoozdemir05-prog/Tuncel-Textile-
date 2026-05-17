"""Phase 6 backend tests — Gift Cards + Analytics + checkout_status flip."""
import os
import re
import uuid
import pytest
import requests
from datetime import datetime, timezone, timedelta

# load backend env so we can poke db directly for seeding
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
import asyncio  # noqa: E402

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
ADMIN_TOKEN = "tuncel2026admin"
HEADERS = {"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"}
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

mongo = AsyncIOMotorClient(MONGO_URL)
db = mongo[DB_NAME]


# ------------------------------------------------------------------
# Analytics
# ------------------------------------------------------------------
class TestAnalytics:
    def test_requires_admin(self):
        r = requests.get(f"{BASE_URL}/api/admin/analytics")
        assert r.status_code == 401

    @pytest.mark.parametrize("days", [7, 30, 90, 365])
    def test_analytics_ranges(self, days):
        r = requests.get(f"{BASE_URL}/api/admin/analytics?days={days}", headers=HEADERS)
        assert r.status_code == 200, r.text
        data = r.json()
        # required keys
        required = {
            "revenue", "orders_count", "aov", "daily", "top_products",
            "returns_count", "refunded_count", "exchanged_count", "return_rate_pct",
            "chat_ai_replies", "chat_human_replies", "chat_ai_share_pct",
            "custom_requests_count", "gift_cards_active", "gift_cards_revenue",
            "range_days",
        }
        missing = required - set(data.keys())
        assert not missing, f"missing keys: {missing}"
        assert data["range_days"] == days
        assert isinstance(data["daily"], list)
        assert isinstance(data["top_products"], list)
        assert len(data["top_products"]) <= 5


# ------------------------------------------------------------------
# Gift cards
# ------------------------------------------------------------------
GIFT_CODE_PATTERN = re.compile(r"^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$")


class TestGiftCardCheckout:
    def test_amount_zero_rejected(self):
        r = requests.post(f"{BASE_URL}/api/gift-cards/checkout", json={
            "amount": 0, "buyer_name": "TEST", "buyer_email": "test@example.com",
        })
        assert r.status_code == 400

    def test_amount_too_high_rejected(self):
        r = requests.post(f"{BASE_URL}/api/gift-cards/checkout", json={
            "amount": 1001, "buyer_name": "TEST", "buyer_email": "test@example.com",
        })
        assert r.status_code == 400

    def test_valid_purchase_creates_session(self):
        payload = {
            "amount": 50,
            "buyer_name": "TEST Buyer",
            "buyer_email": "TEST_buyer@example.com",
            "recipient_name": "TEST Recipient",
            "recipient_email": "TEST_rec@example.com",
            "message": "TEST message",
        }
        r = requests.post(f"{BASE_URL}/api/gift-cards/checkout", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "reference" in data and data["reference"].startswith("GC-")
        assert "checkout_url" in data and "stripe.com" in data["checkout_url"]
        assert "session_id" in data and data["session_id"].startswith("cs_")

        # Validate DB entry
        async def fetch():
            return await db.gift_cards.find_one({"reference": data["reference"]}, {"_id": 0})
        gc = asyncio.get_event_loop().run_until_complete(fetch())
        assert gc is not None
        assert gc["status"] == "pending_payment"
        assert GIFT_CODE_PATTERN.match(gc["code"]), f"bad code format: {gc['code']}"
        # 365 day expiry (give 2-day tolerance)
        exp = datetime.fromisoformat(gc["expires_at"])
        now = datetime.now(timezone.utc)
        delta = exp - now
        assert 360 <= delta.days <= 366, f"expiry off: {delta.days}"
        # Cleanup: leave pending_payment in DB to test validate

        # Save reference for downstream tests
        pytest._test_gift_ref = data["reference"]
        pytest._test_gift_code = gc["code"]
        pytest._test_gift_session = data["session_id"]


class TestGiftCardValidate:
    def test_nonexistent_returns_404(self):
        r = requests.get(f"{BASE_URL}/api/gift-cards/validate/ZZZZ-ZZZZ-ZZZZ-ZZZZ")
        assert r.status_code == 404

    def test_pending_payment_returns_400(self):
        # Use the code from previous test
        code = getattr(pytest, "_test_gift_code", None)
        if not code:
            pytest.skip("no pending code seeded")
        r = requests.get(f"{BASE_URL}/api/gift-cards/validate/{code}")
        assert r.status_code == 400

    def test_active_returns_balance(self):
        # Seed an active card directly
        code = "TEST-ACTV-CARD-AAAA"
        async def seed():
            await db.gift_cards.delete_many({"code": code})
            await db.gift_cards.insert_one({
                "id": str(uuid.uuid4()),
                "reference": "GC-TESTACT",
                "code": code,
                "amount": 100.0,
                "balance": 100.0,
                "currency": "eur",
                "status": "active",
                "buyer_name": "T", "buyer_email": "t@t.t",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=300)).isoformat(),
            })
        asyncio.get_event_loop().run_until_complete(seed())
        r = requests.get(f"{BASE_URL}/api/gift-cards/validate/{code}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["balance"] == 100.0
        assert data["status"] == "active"
        assert "expires_at" in data


# ------------------------------------------------------------------
# Admin gift cards CRUD
# ------------------------------------------------------------------
class TestAdminGiftCards:
    def test_admin_list(self):
        r = requests.get(f"{BASE_URL}/api/admin/gift-cards", headers=HEADERS)
        assert r.status_code == 200
        cards = r.json()
        assert isinstance(cards, list)
        # Should be sorted by created_at desc
        if len(cards) >= 2:
            assert cards[0]["created_at"] >= cards[1]["created_at"]

    def test_admin_update_status(self):
        # Create a card in DB to update
        cid = str(uuid.uuid4())
        async def seed():
            await db.gift_cards.insert_one({
                "id": cid,
                "reference": "GC-UPDTEST",
                "code": "TEST-UPDT-CARD-BBBB",
                "amount": 25.0, "balance": 25.0, "currency": "eur",
                "status": "pending_payment",
                "buyer_name": "T", "buyer_email": "t@t.t",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=300)).isoformat(),
            })
        asyncio.get_event_loop().run_until_complete(seed())
        r = requests.put(f"{BASE_URL}/api/admin/gift-cards/{cid}", json={"status": "active"}, headers=HEADERS)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "active"

        # cancel it
        r = requests.put(f"{BASE_URL}/api/admin/gift-cards/{cid}", json={"status": "cancelled"}, headers=HEADERS)
        assert r.status_code == 200
        assert r.json()["status"] == "cancelled"

    def test_admin_update_404(self):
        r = requests.put(f"{BASE_URL}/api/admin/gift-cards/nonexistent", json={"status": "active"}, headers=HEADERS)
        assert r.status_code == 404


# ------------------------------------------------------------------
# checkout_status flip — gift card pending_payment → active
# ------------------------------------------------------------------
class TestCheckoutStatusGiftFlip:
    def test_already_active_returns_paid(self):
        # Seed an already-active gift card with a stripe_session_id
        sid = f"cs_test_seed_{uuid.uuid4().hex[:8]}"
        async def seed():
            await db.gift_cards.insert_one({
                "id": str(uuid.uuid4()),
                "reference": "GC-SEEDACT",
                "code": "TEST-SEED-ACTV-CCCC",
                "amount": 75.0, "balance": 75.0, "currency": "eur",
                "status": "active",
                "buyer_name": "T", "buyer_email": "t@t.t",
                "stripe_session_id": sid,
                "activated_at": datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=300)).isoformat(),
            })
        asyncio.get_event_loop().run_until_complete(seed())
        r = requests.get(f"{BASE_URL}/api/checkout/status/{sid}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["payment_status"] == "paid"
        assert data["amount_total"] == 75.0

    def test_unknown_session_404(self):
        r = requests.get(f"{BASE_URL}/api/checkout/status/cs_test_does_not_exist_xyz")
        assert r.status_code == 404


# ------------------------------------------------------------------
# Regression — Phase 5 sanity (products, settings, faqs, custom requests, IBAN)
# ------------------------------------------------------------------
class TestRegression:
    def test_products(self):
        r = requests.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        assert len(r.json()) >= 5

    def test_settings_eur(self):
        r = requests.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        # IBAN config exists
        assert "iban" in r.json()

    def test_faqs(self):
        r = requests.get(f"{BASE_URL}/api/faqs")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_hero(self):
        r = requests.get(f"{BASE_URL}/api/hero")
        assert r.status_code == 200


# Cleanup
def teardown_module(_module):
    async def clean():
        await db.gift_cards.delete_many({"code": {"$regex": "^TEST-"}})
        await db.gift_cards.delete_many({"reference": {"$in": ["GC-UPDTEST", "GC-SEEDACT"]}})
        await db.gift_cards.delete_many({"buyer_email": {"$regex": "^TEST_"}})
    try:
        asyncio.get_event_loop().run_until_complete(clean())
    except Exception:
        pass
