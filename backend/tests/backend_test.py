"""Backend tests for Tuncel Textile e-commerce API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tuncel-textile.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def all_products(client):
    r = client.get(f"{API}/products", timeout=30)
    assert r.status_code == 200
    return r.json()


# -------- Products --------
class TestProducts:
    def test_list_all_products(self, all_products):
        assert isinstance(all_products, list)
        assert len(all_products) == 11
        required = {"id", "name", "price", "category", "product_type", "image_url", "sizes", "colors"}
        for p in all_products:
            assert required.issubset(p.keys())
            assert "_id" not in p  # no Mongo _id leak

    def test_filter_men(self, client):
        r = client.get(f"{API}/products", params={"category": "men"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 4
        assert all(p["category"] == "men" for p in data)

    def test_filter_women(self, client):
        r = client.get(f"{API}/products", params={"category": "women"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 4
        assert all(p["category"] == "women" for p in data)

    def test_filter_accessories(self, client):
        r = client.get(f"{API}/products", params={"category": "accessories"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        assert all(p["category"] == "accessories" for p in data)

    def test_filter_product_type_hoodie(self, client):
        r = client.get(f"{API}/products", params={"product_type": "hoodie"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert all(p["product_type"] == "hoodie" for p in data)

    def test_filter_featured(self, client):
        r = client.get(f"{API}/products", params={"featured": "true"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert all(p.get("featured") is True for p in data)

    def test_get_product_by_id(self, client, all_products):
        pid = all_products[0]["id"]
        r = client.get(f"{API}/products/{pid}")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == pid
        assert "_id" not in data

    def test_get_product_invalid_id(self, client):
        r = client.get(f"{API}/products/nonexistent-id-xyz")
        assert r.status_code == 404


# -------- Checkout --------
class TestCheckout:
    session_id_holder = {}

    def test_create_session_empty_items(self, client):
        r = client.post(f"{API}/checkout/session", json={"items": [], "origin_url": BASE_URL})
        assert r.status_code == 400

    def test_create_session_invalid_product(self, client):
        payload = {"items": [{"product_id": "bad-id", "quantity": 1}], "origin_url": BASE_URL}
        r = client.post(f"{API}/checkout/session", json=payload)
        assert r.status_code == 400

    def test_create_session_success(self, client, all_products):
        prod = all_products[0]
        payload = {
            "items": [{"product_id": prod["id"], "quantity": 2, "size": "M", "color": "Black"}],
            "origin_url": BASE_URL,
            "customer_email": "TEST_buyer@example.com",
        }
        r = client.post(f"{API}/checkout/session", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data and "session_id" in data
        assert "stripe.com" in data["url"].lower() or "checkout.stripe" in data["url"].lower()
        TestCheckout.session_id_holder["sid"] = data["session_id"]
        TestCheckout.session_id_holder["expected_total"] = round(float(prod["price"]) * 2, 2)

    def test_checkout_status(self, client):
        sid = TestCheckout.session_id_holder.get("sid")
        if not sid:
            pytest.skip("No session created")
        r = client.get(f"{API}/checkout/status/{sid}")
        assert r.status_code == 200
        data = r.json()
        for k in ("status", "payment_status", "amount_total", "currency"):
            assert k in data
        # amount_total should equal server-computed total (when not yet paid, returned via Stripe *100/100)
        expected = TestCheckout.session_id_holder["expected_total"]
        # Allow for either representation, but for open session it should match
        assert abs(float(data["amount_total"]) - expected) < 0.01

    def test_webhook_endpoint_exists(self, client):
        # Invalid signature -> 400 but endpoint is reachable
        r = client.post(f"{API}/webhook/stripe", data=b"{}", headers={"Stripe-Signature": "invalid"})
        assert r.status_code in (400, 422, 500)  # reachable, rejects bad sig
        assert r.status_code != 404
