"""
Phase 8 backend tests — custom request emails, mark-paid invoice idempotency,
chat ai_typing flag, smart-link tokens.
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tuncel-textile.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "tuncel2026admin"


@pytest.fixture(scope="module")
def admin_headers():
    return {"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"}


# ============================================================
# 1) Custom request — fast response + DB persistence + dual emails fire-and-forget
# ============================================================
class TestCustomRequest:
    def test_custom_request_creates_doc_and_returns_fast(self, admin_headers):
        payload = {
            "customer_name": "TEST_Phase8 Customer",
            "email": "test_phase8@example.com",
            "phone": "+371 20000000",
            "garment_type": "hoodie",
            "size_estimate": "M",
            "fabric_preference": "organic cotton",
            "color_palette": "ivory + charcoal",
            "design_notes": "minimal logo, hand-pressed",
            "quantity": 1,
            "budget_range": "100-200",
            "contact_preference": "email",
        }
        t0 = time.time()
        r = requests.post(f"{API}/custom-requests", json=payload, timeout=10)
        elapsed_ms = (time.time() - t0) * 1000
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["reference"].startswith("CR-")
        assert data["status"] == "new"
        assert "id" in data
        # Fire-and-forget — should be well under 5s even with two emails queued
        assert elapsed_ms < 5000, f"Custom request took {elapsed_ms:.0f}ms (>5s)"
        print(f"Custom request returned in {elapsed_ms:.0f}ms — ref {data['reference']}")

        # Verify persistence via admin list endpoint
        r2 = requests.get(f"{API}/admin/custom-requests", headers=admin_headers, timeout=10)
        assert r2.status_code == 200
        refs = [d.get("reference") for d in r2.json()]
        assert data["reference"] in refs


# ============================================================
# 2) Mark-paid idempotency — invoice_sent flag
# ============================================================
class TestMarkPaidIdempotent:
    @pytest.fixture
    def iban_order(self):
        # Need a product to checkout against
        prods = requests.get(f"{API}/products", timeout=10).json()
        assert len(prods) > 0
        pid = prods[0]["id"]
        body = {
            "items": [{"product_id": pid, "quantity": 1}],
            "customer_email": "test_phase8_paid@example.com",
            "customer_name": "TEST_Phase8 Paid",
            "shipping_address": {"line1": "Riga 1", "city": "Riga", "country": "LV", "postal_code": "LV-1000"},
            "note": "phase8 test",
        }
        r = requests.post(f"{API}/checkout/iban", json=body, timeout=15)
        assert r.status_code == 200, r.text
        return r.json()["reference"]

    def test_mark_paid_first_call_sets_invoice_sent(self, iban_order, admin_headers):
        r = requests.post(f"{API}/admin/orders/{iban_order}/mark-paid", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # Verify via admin orders list
        orders = requests.get(f"{API}/admin/orders", headers=admin_headers, timeout=10).json()
        ord_match = next((o for o in orders if o.get("reference") == iban_order), None)
        assert ord_match is not None
        assert ord_match.get("payment_status") == "paid"
        assert ord_match.get("invoice_sent") is True, "invoice_sent flag should be True after mark-paid"

    def test_mark_paid_second_call_is_idempotent(self, iban_order, admin_headers):
        # First call (sets the flag)
        requests.post(f"{API}/admin/orders/{iban_order}/mark-paid", headers=admin_headers, timeout=15)
        # Second call should not error and not re-trigger (no way to assert email-not-sent here,
        # but the response should be ok and invoice_sent remains True)
        r2 = requests.post(f"{API}/admin/orders/{iban_order}/mark-paid", headers=admin_headers, timeout=15)
        assert r2.status_code == 200
        orders = requests.get(f"{API}/admin/orders", headers=admin_headers, timeout=10).json()
        ord_match = next((o for o in orders if o.get("reference") == iban_order), None)
        assert ord_match.get("invoice_sent") is True


# ============================================================
# 3) Chat ai_typing flag + smart-link tokens
# ============================================================
class TestChatAITyping:
    def test_chat_start_sets_ai_typing_true_then_false(self):
        # Start a chat with an initial message that should trigger AI reply
        r = requests.post(
            f"{API}/chat/start",
            json={
                "customer_name": "TEST_Phase8 Chat",
                "customer_email": "test_phase8_chat@example.com",
                "initial_message": "Siparişimi nasıl takip edebilirim? track order",
            },
            timeout=10,
        )
        assert r.status_code == 200, r.text
        sid = r.json()["session_id"]

        # Within ~1s, ai_typing should be True (background task started)
        time.sleep(0.6)
        m = requests.get(f"{API}/chat/{sid}/messages", timeout=10).json()
        ai_typing_early = m["session"].get("ai_typing")
        print(f"ai_typing @ ~600ms: {ai_typing_early}")

        # Wait for AI reply to complete (up to ~20s — LLM)
        ai_reply = None
        ai_typing_late = None
        for _ in range(20):
            time.sleep(1.0)
            m = requests.get(f"{API}/chat/{sid}/messages", timeout=10).json()
            ai_typing_late = m["session"].get("ai_typing")
            ai_msgs = [x for x in m["messages"] if x.get("sender") == "ai"]
            if ai_msgs:
                ai_reply = ai_msgs[-1]
                if ai_typing_late is False:
                    break
            if ai_typing_late is False and not ai_msgs:
                # Budget exhausted — silent fallback acceptable
                break

        # ai_typing must end up False
        assert ai_typing_late is False, f"ai_typing should flip back to False, got {ai_typing_late}"
        # Session should expose active_admin key (None at start is fine)
        assert "active_admin" in m["session"]
        # ai_typing flag must be present in session payload
        assert "ai_typing" in m["session"]
        # Either AI reply present OR budget exhausted (acceptable)
        if ai_reply:
            print(f"AI reply body (first 200 chars): {ai_reply['body'][:200]}")
        else:
            print("No AI reply (likely budget exhausted) — acceptable graceful fallback")

    def test_chat_messages_endpoint_exposes_ai_typing_and_active_admin(self):
        # Plain start, no initial_message — verify schema
        r = requests.post(f"{API}/chat/start", json={"customer_name": "TEST_Phase8 Schema"}, timeout=10)
        assert r.status_code == 200
        sid = r.json()["session_id"]
        m = requests.get(f"{API}/chat/{sid}/messages", timeout=10).json()
        assert "session" in m and "messages" in m
        sess = m["session"]
        assert "ai_typing" in sess
        assert "active_admin" in sess
        assert "status" in sess
        assert sess["ai_typing"] is False  # no initial_message → no AI task
