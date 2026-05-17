"""End-to-end backend tests for Phase 2 (Order Tracking & Fulfillment),
Phase 3 (Returns/Exchanges), and Phase 4 (Live Chat).

Run: pytest /app/backend/tests/test_phase234.py -v
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "tuncel2026admin"
ADMIN_HEADERS = {"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"}


# ----------------------------------------------------------------------
# Shared fixture — create one IBAN order to use across Phase 2 / Phase 3
# ----------------------------------------------------------------------
@pytest.fixture(scope="module")
def test_order():
    """Create an IBAN order to use for tracking + returns tests."""
    # Pick a real product
    pr = requests.get(f"{API}/products", timeout=10)
    assert pr.status_code == 200 and len(pr.json()) > 0, "No products to seed an order"
    product_id = pr.json()[0]["id"]

    email = f"test_phase234_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "customer_name": "TEST_PHASE234 Customer",
        "customer_email": email,
        "items": [{"product_id": product_id, "quantity": 2, "size": "M"}],
        "shipping_address": "Some street 1, 1000 Riga, LV",
    }
    r = requests.post(f"{API}/checkout/iban", json=payload, timeout=15)
    assert r.status_code == 200, f"Could not create IBAN order: {r.status_code} {r.text}"
    data = r.json()
    return {"reference": data["reference"], "email": email, "amount": data.get("amount")}


# ====================================================================
# PHASE 2 — ORDER LOOKUP
# ====================================================================
class TestOrderLookup:
    def test_lookup_valid(self, test_order):
        r = requests.post(f"{API}/order-lookup", json={
            "reference": test_order["reference"],
            "email": test_order["email"],
        }, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["reference"] == test_order["reference"]
        assert d["customer_email"].lower() == test_order["email"].lower()
        assert d["fulfillment_status"] == "pending"
        # Tracking fields exist (None until set)
        for f in ("tracking_carrier", "tracking_number", "tracking_url", "shipping_note"):
            assert f in d

    def test_lookup_wrong_email(self, test_order):
        r = requests.post(f"{API}/order-lookup", json={
            "reference": test_order["reference"],
            "email": "wrong@example.com",
        }, timeout=10)
        assert r.status_code == 404

    def test_lookup_wrong_reference(self, test_order):
        r = requests.post(f"{API}/order-lookup", json={
            "reference": "TT-NOTFOUND",
            "email": test_order["email"],
        }, timeout=10)
        assert r.status_code == 404

    def test_lookup_case_insensitive_email(self, test_order):
        r = requests.post(f"{API}/order-lookup", json={
            "reference": test_order["reference"],
            "email": test_order["email"].upper(),
        }, timeout=10)
        assert r.status_code == 200


# ====================================================================
# PHASE 2 — ADMIN FULFILLMENT
# ====================================================================
class TestFulfillment:
    def test_invalid_status(self, test_order):
        r = requests.put(
            f"{API}/admin/orders/{test_order['reference']}/fulfillment",
            json={"fulfillment_status": "bogus"},
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 400

    def test_requires_admin_token(self, test_order):
        r = requests.put(
            f"{API}/admin/orders/{test_order['reference']}/fulfillment",
            json={"fulfillment_status": "processing"},
            headers={"Content-Type": "application/json"}, timeout=10,
        )
        assert r.status_code in (401, 403)

    def test_status_transitions_and_timestamps(self, test_order):
        # pending -> processing
        r = requests.put(
            f"{API}/admin/orders/{test_order['reference']}/fulfillment",
            json={"fulfillment_status": "processing"},
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["fulfillment_status"] == "processing"

        # processing -> shipped (with tracking)
        r = requests.put(
            f"{API}/admin/orders/{test_order['reference']}/fulfillment",
            json={
                "fulfillment_status": "shipped",
                "tracking_carrier": "Omniva",
                "tracking_number": "AB1234CD",
                "tracking_url": "https://omniva.lv/track/AB1234CD",
                "shipping_note": "Handed to courier.",
            },
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["fulfillment_status"] == "shipped"
        assert d["tracking_carrier"] == "Omniva"
        assert d["tracking_number"] == "AB1234CD"
        assert d["tracking_url"].endswith("AB1234CD")
        assert d["shipped_at"], "shipped_at should be auto-set"

        # shipped -> delivered
        r = requests.put(
            f"{API}/admin/orders/{test_order['reference']}/fulfillment",
            json={"fulfillment_status": "delivered"},
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["fulfillment_status"] == "delivered"
        assert d["delivered_at"], "delivered_at should be auto-set"

    def test_fulfillment_visible_to_customer(self, test_order):
        # After admin updates, lookup should reflect tracking
        r = requests.post(f"{API}/order-lookup", json={
            "reference": test_order["reference"],
            "email": test_order["email"],
        }, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["fulfillment_status"] == "delivered"
        assert d["tracking_carrier"] == "Omniva"
        assert d["tracking_number"] == "AB1234CD"

    def test_unknown_order_404(self):
        r = requests.put(
            f"{API}/admin/orders/TT-NOPE/fulfillment",
            json={"fulfillment_status": "processing"},
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 404


# ====================================================================
# PHASE 3 — RETURNS / EXCHANGES
# ====================================================================
class TestReturns:
    return_id = None
    return_ref = None

    def test_create_return_refund(self, test_order):
        r = requests.post(f"{API}/returns", json={
            "order_reference": test_order["reference"],
            "email": test_order["email"],
            "return_type": "refund",
            "reason": "quality_issue",
            "description": "TEST_PHASE234 — fabric had a stitching defect on the left sleeve.",
            "items": ["Hoodie XL"],
            "iban_for_refund": "LV80BANK0000435195001",
        }, timeout=10)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["reference"].startswith("RT-")
        assert len(d["reference"]) == 9
        assert d["status"] == "pending"
        TestReturns.return_id = d["id"]
        TestReturns.return_ref = d["reference"]

    def test_wrong_email(self, test_order):
        r = requests.post(f"{API}/returns", json={
            "order_reference": test_order["reference"],
            "email": "wrong@example.com",
            "return_type": "refund",
            "reason": "quality_issue",
            "description": "x",
        }, timeout=10)
        assert r.status_code == 404

    def test_invalid_return_type(self, test_order):
        r = requests.post(f"{API}/returns", json={
            "order_reference": test_order["reference"],
            "email": test_order["email"],
            "return_type": "store_credit",
            "reason": "quality_issue",
            "description": "x",
        }, timeout=10)
        assert r.status_code == 400

    def test_invalid_reason(self, test_order):
        r = requests.post(f"{API}/returns", json={
            "order_reference": test_order["reference"],
            "email": test_order["email"],
            "return_type": "refund",
            "reason": "i_just_dont_like_it",
            "description": "x",
        }, timeout=10)
        assert r.status_code == 400

    def test_description_too_long(self, test_order):
        r = requests.post(f"{API}/returns", json={
            "order_reference": test_order["reference"],
            "email": test_order["email"],
            "return_type": "refund",
            "reason": "changed_mind",
            "description": "A" * 4001,
        }, timeout=10)
        assert r.status_code == 400

    def test_admin_list_returns(self):
        r = requests.get(f"{API}/admin/returns", headers=ADMIN_HEADERS, timeout=10)
        assert r.status_code == 200
        items = r.json()
        assert any(i.get("reference") == TestReturns.return_ref for i in items)

    def test_admin_list_requires_token(self):
        r = requests.get(f"{API}/admin/returns", timeout=10)
        assert r.status_code in (401, 403)

    def test_admin_update_status_transitions(self):
        assert TestReturns.return_id, "test_create_return_refund must succeed first"
        for status in ["approved", "in_transit", "received", "refunded"]:
            r = requests.put(
                f"{API}/admin/returns/{TestReturns.return_id}",
                json={"status": status, "admin_notes": f"TEST_PHASE234 moved to {status}"},
                headers=ADMIN_HEADERS, timeout=10,
            )
            assert r.status_code == 200, r.text
            assert r.json()["status"] == status
            assert "moved to" in (r.json().get("admin_notes") or "")

    def test_admin_update_invalid_status(self):
        r = requests.put(
            f"{API}/admin/returns/{TestReturns.return_id}",
            json={"status": "WHATEVER"},
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 400

    def test_create_exchange(self, test_order):
        r = requests.post(f"{API}/returns", json={
            "order_reference": test_order["reference"],
            "email": test_order["email"],
            "return_type": "exchange",
            "reason": "size_too_small",
            "description": "TEST_PHASE234 — need a bigger size.",
            "items": ["Tee M"],
            "exchange_size": "L",
        }, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["reference"].startswith("RT-")


# ====================================================================
# PHASE 4 — LIVE CHAT
# ====================================================================
class TestChat:
    session_id = None

    def test_chat_start(self):
        r = requests.post(f"{API}/chat/start", json={
            "customer_name": "TEST_PHASE234 Chatter",
            "customer_email": "chat_test@example.com",
            "initial_message": "Hi, do you ship to Estonia?",
        }, timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d.get("session_id")
        TestChat.session_id = d["session_id"]

    def test_chat_fetch_messages(self):
        r = requests.get(f"{API}/chat/{TestChat.session_id}/messages", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["session"]["status"] == "open"
        assert len(d["messages"]) >= 1
        assert d["messages"][0]["sender"] == "customer"

    def test_customer_send_message(self):
        r = requests.post(
            f"{API}/chat/{TestChat.session_id}/message",
            json={"body": "Following up — what's the lead time?"},
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["sender"] == "customer"

    def test_customer_send_empty(self):
        r = requests.post(
            f"{API}/chat/{TestChat.session_id}/message",
            json={"body": "   "},
            timeout=10,
        )
        assert r.status_code == 400

    def test_admin_lists_sessions(self):
        r = requests.get(f"{API}/admin/chat/sessions", headers=ADMIN_HEADERS, timeout=10)
        assert r.status_code == 200
        sessions = r.json()
        assert any(s.get("id") == TestChat.session_id for s in sessions)

    def test_admin_lists_sessions_requires_token(self):
        r = requests.get(f"{API}/admin/chat/sessions", timeout=10)
        assert r.status_code in (401, 403)

    def test_admin_reply(self):
        r = requests.post(
            f"{API}/admin/chat/{TestChat.session_id}/reply",
            json={"body": "Yes, we ship to Estonia in 3-5 business days."},
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 200
        assert r.json()["sender"] == "admin"

    def test_customer_polls_with_since_filter(self):
        # Use a past timestamp to fetch all messages — covers ?since= path
        r = requests.get(
            f"{API}/chat/{TestChat.session_id}/messages?since=2020-01-01T00:00:00Z",
            timeout=10,
        )
        assert r.status_code == 200
        d = r.json()
        senders = {m["sender"] for m in d["messages"]}
        assert "admin" in senders, "Customer should see admin reply via polling"

    def test_admin_close_session(self):
        r = requests.put(
            f"{API}/admin/chat/{TestChat.session_id}/close",
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 200

    def test_post_to_closed_chat_400(self):
        r = requests.post(
            f"{API}/chat/{TestChat.session_id}/message",
            json={"body": "Late message"},
            timeout=10,
        )
        assert r.status_code == 400

    def test_admin_session_detail(self):
        r = requests.get(
            f"{API}/admin/chat/{TestChat.session_id}",
            headers=ADMIN_HEADERS, timeout=10,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["session"]["status"] == "closed"
        assert len(d["messages"]) >= 2  # initial + admin reply


# ====================================================================
# REGRESSION — make sure prior endpoints still work
# ====================================================================
class TestRegression:
    def test_products_list(self):
        r = requests.get(f"{API}/products", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_settings(self):
        r = requests.get(f"{API}/settings", timeout=10)
        assert r.status_code == 200

    def test_hero(self):
        r = requests.get(f"{API}/hero", timeout=10)
        assert r.status_code == 200

    def test_cms(self):
        r = requests.get(f"{API}/cms", timeout=10)
        assert r.status_code == 200

    def test_faqs(self):
        r = requests.get(f"{API}/faqs", timeout=10)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_custom_request_submit(self):
        r = requests.post(f"{API}/custom-requests", json={
            "customer_name": "TEST_PHASE234 RegressionCR",
            "email": "regr@example.com",
            "product_type": "hoodie",
            "idea_description": "Regression check",
            "contact_preference": "email",
        }, timeout=10)
        assert r.status_code == 200, r.text
        assert r.json().get("reference", "").startswith("CR-")

    def test_admin_orders_list(self):
        r = requests.get(f"{API}/admin/orders", headers=ADMIN_HEADERS, timeout=10)
        assert r.status_code == 200
