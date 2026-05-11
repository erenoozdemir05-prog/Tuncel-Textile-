"""Iteration 2 backend tests: admin CRUD, image upload, auth/me, auth/session, orders."""
import os
import io
import base64
import pytest
import requests

from dotenv import load_dotenv
load_dotenv("/app/frontend/.env")
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "tuncel2026admin"
ADMIN_HEADER = {"X-Admin-Token": ADMIN_PASSWORD}

# 1x1 transparent PNG bytes
TINY_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)


# -------- Admin Auth --------
class TestAdminAuth:
    def test_admin_login_success(self):
        r = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("token") == ADMIN_PASSWORD

    def test_admin_login_wrong_password(self):
        r = requests.post(f"{API}/admin/login", json={"password": "wrongpass"}, timeout=15)
        assert r.status_code == 401


# -------- Admin Product CRUD --------
class TestAdminProducts:
    created_id = {}

    def test_create_product_requires_admin(self):
        payload = {
            "name": "TEST_Unauth Tee", "description": "no header",
            "price": 10.0, "category": "men", "product_type": "tshirt",
            "image_url": "https://example.com/x.jpg",
        }
        r = requests.post(f"{API}/admin/products", json=payload, timeout=15)
        assert r.status_code == 401

    def test_create_product_wrong_token(self):
        r = requests.post(
            f"{API}/admin/products",
            json={"name": "x", "description": "x", "price": 1.0, "category": "men",
                  "product_type": "tshirt", "image_url": "https://x"},
            headers={"X-Admin-Token": "bad"}, timeout=15,
        )
        assert r.status_code == 401

    def test_create_product_success(self):
        payload = {
            "name": "TEST_Admin Tee",
            "description": "Created by admin tests",
            "price": 49.99,
            "category": "men",
            "product_type": "tshirt",
            "image_url": "https://images.pexels.com/photos/8217430/pexels-photo-8217430.jpeg",
            "sizes": ["S", "M", "L"],
            "colors": ["Black"],
            "in_stock": True,
            "featured": False,
            "print_name": "TEST/01",
        }
        r = requests.post(f"{API}/admin/products", json=payload, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["price"] == 49.99
        TestAdminProducts.created_id["id"] = data["id"]

        # Verify via GET
        g = requests.get(f"{API}/products/{data['id']}", timeout=15)
        assert g.status_code == 200
        assert g.json()["name"] == payload["name"]

    def test_update_product(self):
        pid = TestAdminProducts.created_id.get("id")
        if not pid:
            pytest.skip("create test failed")
        payload = {
            "name": "TEST_Admin Tee Updated",
            "description": "Updated description",
            "price": 59.99,
            "category": "men",
            "product_type": "tshirt",
            "image_url": "https://images.pexels.com/photos/8217430/pexels-photo-8217430.jpeg",
            "sizes": ["M", "L"],
            "colors": ["White"],
            "in_stock": True,
            "featured": True,
            "print_name": "TEST/02",
        }
        r = requests.put(f"{API}/admin/products/{pid}", json=payload, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        # Verify via GET
        g = requests.get(f"{API}/products/{pid}", timeout=15)
        assert g.status_code == 200
        gd = g.json()
        assert gd["name"] == "TEST_Admin Tee Updated"
        assert gd["price"] == 59.99
        assert gd["featured"] is True

    def test_update_requires_admin(self):
        pid = TestAdminProducts.created_id.get("id")
        if not pid:
            pytest.skip("create test failed")
        r = requests.put(f"{API}/admin/products/{pid}", json={
            "name": "x", "description": "x", "price": 1.0, "category": "men",
            "product_type": "tshirt", "image_url": "https://x",
        }, timeout=15)
        assert r.status_code == 401

    def test_delete_product(self):
        pid = TestAdminProducts.created_id.get("id")
        if not pid:
            pytest.skip("create test failed")
        r = requests.delete(f"{API}/admin/products/{pid}", headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        # Verify gone
        g = requests.get(f"{API}/products/{pid}", timeout=15)
        assert g.status_code == 404

    def test_delete_requires_admin(self):
        r = requests.delete(f"{API}/admin/products/some-id", timeout=15)
        assert r.status_code == 401

    def test_delete_nonexistent(self):
        r = requests.delete(f"{API}/admin/products/does-not-exist-xyz", headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 404


# -------- Admin Image Upload --------
class TestAdminUpload:
    def test_upload_requires_admin(self):
        files = {"file": ("test.png", io.BytesIO(TINY_PNG), "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files, timeout=30)
        assert r.status_code == 401

    def test_upload_png_success(self):
        files = {"file": ("test.png", io.BytesIO(TINY_PNG), "image/png")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=ADMIN_HEADER, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "path" in data and "url" in data
        assert data["path"].endswith(".png")
        # NOTE: data["url"] uses internal cluster base_url (bug). Verify via public URL:
        public_url = f"{API}/files/{data['path']}"
        g = requests.get(public_url, timeout=30)
        assert g.status_code == 200
        assert g.headers.get("content-type", "").startswith("image/")
        assert len(g.content) > 0

    def test_upload_unsupported_type(self):
        files = {"file": ("evil.exe", io.BytesIO(b"MZ\x00\x00"), "application/octet-stream")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=ADMIN_HEADER, timeout=30)
        assert r.status_code == 400


# -------- Auth (Google session) --------
class TestAuth:
    def test_me_without_session(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_session_invalid(self):
        r = requests.post(f"{API}/auth/session", json={"session_id": "definitely-not-real"}, timeout=20)
        assert r.status_code == 401


# -------- Orders --------
class TestOrders:
    def test_orders_without_auth(self):
        r = requests.get(f"{API}/orders", timeout=15)
        assert r.status_code == 401
