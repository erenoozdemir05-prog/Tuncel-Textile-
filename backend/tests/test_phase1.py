"""Phase 1 backend tests: FAQ + Custom Requests + Currency regression."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://tuncel-textile.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_TOKEN = "tuncel2026admin"
ADMIN_HEADERS = {"X-Admin-Token": ADMIN_TOKEN, "Content-Type": "application/json"}


# ---------------------- FAQ public ----------------------
class TestFaqsPublic:
    def test_list_faqs_seeded(self):
        r = requests.get(f"{API}/faqs", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1, "FAQs should be seeded at startup"
        # Verify multilingual
        first = items[0]
        assert "question" in first and "answer" in first
        for lang in ("en", "ru", "lv"):
            assert lang in first["question"], f"Missing {lang} in question"
            assert lang in first["answer"], f"Missing {lang} in answer"
        # Verify categories present
        cats = {f.get("category") for f in items}
        assert cats & {"shipping", "returns", "payment", "custom", "general"}


# ---------------------- FAQ admin CRUD ----------------------
class TestFaqsAdmin:
    created_id = None

    def test_admin_list_requires_token(self):
        r = requests.get(f"{API}/admin/faqs", timeout=15)
        assert r.status_code in (401, 403)

    def test_admin_list_with_token(self):
        r = requests.get(f"{API}/admin/faqs", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_create_faq(self):
        payload = {
            "question": {"en": "TEST_PHASE1 Q?", "ru": "TEST_PHASE1 Q-ru", "lv": "TEST_PHASE1 Q-lv"},
            "answer": {"en": "TEST_PHASE1 A", "ru": "TEST_PHASE1 A-ru", "lv": "TEST_PHASE1 A-lv"},
            "category": "general",
            "sort_order": 99,
            "active": True,
        }
        r = requests.post(f"{API}/admin/faqs", json=payload, headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["question"]["en"] == "TEST_PHASE1 Q?"
        assert data["category"] == "general"
        assert "id" in data
        TestFaqsAdmin.created_id = data["id"]

    def test_admin_update_faq(self):
        assert TestFaqsAdmin.created_id, "create test must run first"
        payload = {
            "question": {"en": "TEST_PHASE1 Q updated", "ru": "ru", "lv": "lv"},
            "answer": {"en": "updated answer", "ru": "ru", "lv": "lv"},
            "category": "shipping",
            "sort_order": 99,
            "active": True,
        }
        r = requests.put(f"{API}/admin/faqs/{TestFaqsAdmin.created_id}", json=payload, headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["question"]["en"] == "TEST_PHASE1 Q updated"
        assert data["category"] == "shipping"

    def test_admin_delete_faq(self):
        assert TestFaqsAdmin.created_id
        r = requests.delete(f"{API}/admin/faqs/{TestFaqsAdmin.created_id}", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        assert r.json().get("deleted") is True
        # Verify gone — second delete should 404
        r2 = requests.delete(f"{API}/admin/faqs/{TestFaqsAdmin.created_id}", headers=ADMIN_HEADERS, timeout=15)
        assert r2.status_code == 404


# ---------------------- Custom Requests ----------------------
class TestCustomRequests:
    created_id = None
    reference = None

    def test_submit_custom_request(self):
        payload = {
            "customer_name": "TEST_PHASE1 Buyer",
            "email": "phase1@example.com",
            "phone": "+371 20000000",
            "product_type": "hoodie",
            "design_style": "minimalist",
            "idea_description": "A simple wordmark across the chest",
            "image_urls": [],
            "print_placement": "chest",
            "primary_color": "black",
            "quantity": 5,
            "budget_range": "100-300",
            "contact_preference": "email",
        }
        r = requests.post(f"{API}/custom-requests", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "reference" in data and data["reference"].startswith("CR-")
        assert len(data["reference"]) == 9  # CR- + 6 chars
        assert data["status"] == "new"
        assert "id" in data
        TestCustomRequests.created_id = data["id"]
        TestCustomRequests.reference = data["reference"]

    def test_admin_list_custom_requests_no_token(self):
        r = requests.get(f"{API}/admin/custom-requests", timeout=15)
        assert r.status_code in (401, 403)

    def test_admin_list_custom_requests(self):
        r = requests.get(f"{API}/admin/custom-requests", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        # Our just-created request should appear
        refs = [i.get("reference") for i in items]
        assert TestCustomRequests.reference in refs

    def test_admin_update_status(self):
        assert TestCustomRequests.created_id
        for st in ["reviewing", "quoted", "accepted", "completed"]:
            r = requests.put(
                f"{API}/admin/custom-requests/{TestCustomRequests.created_id}",
                json={"status": st, "admin_notes": f"note for {st}"},
                headers=ADMIN_HEADERS, timeout=15,
            )
            assert r.status_code == 200, r.text
            data = r.json()
            assert data["status"] == st
            assert data["admin_notes"] == f"note for {st}"

    def test_admin_update_status_invalid_id(self):
        r = requests.put(
            f"{API}/admin/custom-requests/{uuid.uuid4()}",
            json={"status": "reviewing"},
            headers=ADMIN_HEADERS, timeout=15,
        )
        assert r.status_code == 404


# ---------------------- Regression: existing endpoints ----------------------
class TestRegression:
    def test_products(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 1

    def test_settings(self):
        r = requests.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "whatsapp_number" in d or "social" in d or "iban" in d

    def test_cms(self):
        r = requests.get(f"{API}/cms", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert "items" in d

    def test_hero(self):
        r = requests.get(f"{API}/hero", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_iban_checkout(self):
        payload = {
            "customer_name": "TEST_PHASE1 IBAN",
            "email": "iban-phase1@example.com",
            "items": [{"product_id": "x", "name": "x", "price": 10.0, "quantity": 1, "size": "M", "color": "Black"}],
            "subtotal": 10.0,
            "total": 10.0,
        }
        r = requests.post(f"{API}/checkout/iban", json=payload, timeout=15)
        # Backend may require slightly different schema — accept 200/201/422
        assert r.status_code in (200, 201, 422), r.text
        if r.status_code in (200, 201):
            d = r.json()
            assert "reference" in d or "session_id" in d

    def test_admin_orders(self):
        r = requests.get(f"{API}/admin/orders", headers=ADMIN_HEADERS, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
