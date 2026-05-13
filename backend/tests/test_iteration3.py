"""Iteration 3 backend tests: site settings, IBAN checkout, hero CMS, global CMS text, product status fields."""
import os
import pytest
import requests

from dotenv import load_dotenv
load_dotenv("/app/frontend/.env")
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "tuncel2026admin"
ADMIN_HEADER = {"X-Admin-Token": ADMIN_PASSWORD}


# -------- Site Settings --------
class TestSettings:
    def test_get_settings_default_shape(self):
        r = requests.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("whatsapp_number", "whatsapp_default_message", "favicon_url", "social", "iban"):
            assert k in d, f"missing {k}"
        for s in ("instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok"):
            assert s in d["social"], f"social.{s} missing"
        for ik in ("bank_name", "account_holder", "iban", "bic", "reference_prefix", "instructions"):
            assert ik in d["iban"], f"iban.{ik} missing"
        # Seeded defaults
        assert d["iban"]["bank_name"] == "Swedbank AS"
        assert d["iban"]["account_holder"] == "Tuncel Textile SIA"
        assert d["iban"]["reference_prefix"] == "TT"

    def test_update_settings_requires_admin(self):
        r = requests.put(f"{API}/admin/settings", json={"whatsapp_default_message": "hi"}, timeout=15)
        assert r.status_code == 401
        r2 = requests.put(f"{API}/admin/settings", json={"whatsapp_default_message": "hi"},
                          headers={"X-Admin-Token": "wrong"}, timeout=15)
        assert r2.status_code == 401

    def test_update_settings_success_and_persistence(self):
        new_msg = "TEST_iter3 settings message"
        new_ig = "https://instagram.com/test_iter3"
        r = requests.put(f"{API}/admin/settings", json={
            "whatsapp_default_message": new_msg,
            "social": {"instagram": new_ig, "facebook": "", "twitter": "", "linkedin": "", "youtube": "", "tiktok": ""},
        }, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        # Re-fetch
        g = requests.get(f"{API}/settings", timeout=15).json()
        assert g["whatsapp_default_message"] == new_msg
        assert g["social"]["instagram"] == new_ig


# -------- IBAN Checkout --------
class TestIbanCheckout:
    ref_holder = {}

    def _pick_product(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert items
        return items[0]

    def test_iban_checkout_create(self):
        prod = self._pick_product()
        payload = {
            "items": [{"product_id": prod["id"], "quantity": 2}],
            "customer_email": "test_iter3@example.com",
            "customer_name": "TEST Iter3",
            "shipping_address": "1 Test Street, Riga",
            "note": "Bank transfer test",
        }
        r = requests.post(f"{API}/checkout/iban", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("reference", "amount", "currency", "iban", "items_summary"):
            assert k in d
        assert d["reference"].startswith("TT-")
        assert d["currency"] == "eur"
        assert d["amount"] == round(float(prod["price"]) * 2, 2)
        assert d["iban"]["bank_name"]
        TestIbanCheckout.ref_holder["ref"] = d["reference"]

    def test_iban_checkout_empty_cart(self):
        r = requests.post(f"{API}/checkout/iban", json={
            "items": [],
            "customer_email": "x@y.com",
            "customer_name": "x",
        }, timeout=15)
        assert r.status_code == 400

    def test_iban_checkout_invalid_email(self):
        prod = self._pick_product()
        r = requests.post(f"{API}/checkout/iban", json={
            "items": [{"product_id": prod["id"], "quantity": 1}],
            "customer_email": "not-an-email",
            "customer_name": "x",
        }, timeout=15)
        assert r.status_code in (400, 422)

    def test_iban_lookup_by_reference(self):
        ref = TestIbanCheckout.ref_holder.get("ref")
        if not ref:
            pytest.skip("create did not produce reference")
        r = requests.get(f"{API}/checkout/iban/{ref}", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["reference"] == ref
        assert d["payment_status"] == "awaiting_bank_transfer"
        assert "iban" in d
        assert "bank_name" in d["iban"]

    def test_iban_lookup_nonexistent(self):
        r = requests.get(f"{API}/checkout/iban/TT-NOPE99", timeout=15)
        assert r.status_code == 404


# -------- Hero CMS --------
class TestHeroCMS:
    created = {}

    def test_list_hero_public_initial(self):
        r = requests.get(f"{API}/hero", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_hero_requires_admin(self):
        r = requests.post(f"{API}/admin/hero", json={}, timeout=15)
        assert r.status_code == 401

    def test_create_hero_slide(self):
        payload = {
            "image_url": "https://example.com/img.jpg",
            "mobile_image_url": "",
            "video_url": "",
            "kicker": {"en": "Drop 01", "ru": "Дроп 01", "lv": "Drops 01"},
            "title": {"en": "HAND CRAFTED", "ru": "РУЧНАЯ РАБОТА", "lv": "ROKU DARBS"},
            "subtitle": {"en": "Limited", "ru": "Лимит", "lv": "Limitēts"},
            "cta_label": {"en": "Shop", "ru": "Магазин", "lv": "Veikals"},
            "cta_url": "/shop/all",
            "blur_enabled": True,
            "overlay_opacity": 0.5,
            "active": True,
            "sort_order": 0,
        }
        r = requests.post(f"{API}/admin/hero", json=payload, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("id")
        assert d["title"]["en"] == "HAND CRAFTED"
        assert d["title"]["ru"] == "РУЧНАЯ РАБОТА"
        assert d["title"]["lv"] == "ROKU DARBS"
        TestHeroCMS.created["id1"] = d["id"]

        # Verify visible in GET /api/hero
        g = requests.get(f"{API}/hero", timeout=15).json()
        assert any(s["id"] == d["id"] for s in g)

    def test_create_second_slide_for_reorder(self):
        payload = {
            "image_url": "https://example.com/img2.jpg",
            "mobile_image_url": "",
            "video_url": "",
            "kicker": {"en": "K2", "ru": "K2", "lv": "K2"},
            "title": {"en": "T2", "ru": "T2", "lv": "T2"},
            "subtitle": {"en": "", "ru": "", "lv": ""},
            "cta_label": {"en": "Go", "ru": "Go", "lv": "Go"},
            "cta_url": "/shop/men",
            "blur_enabled": False,
            "overlay_opacity": 0.3,
            "active": True,
            "sort_order": 1,
        }
        r = requests.post(f"{API}/admin/hero", json=payload, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200
        TestHeroCMS.created["id2"] = r.json()["id"]

    def test_update_hero_slide(self):
        sid = TestHeroCMS.created.get("id1")
        if not sid:
            pytest.skip("no slide")
        payload = {
            "image_url": "https://example.com/img-updated.jpg",
            "mobile_image_url": "",
            "video_url": "",
            "kicker": {"en": "Updated", "ru": "Обнов", "lv": "Atjaunots"},
            "title": {"en": "UPDATED TITLE", "ru": "x", "lv": "x"},
            "subtitle": {"en": "", "ru": "", "lv": ""},
            "cta_label": {"en": "Buy", "ru": "Buy", "lv": "Buy"},
            "cta_url": "/shop/women",
            "blur_enabled": False,
            "overlay_opacity": 0.7,
            "active": True,
            "sort_order": 0,
        }
        r = requests.put(f"{API}/admin/hero/{sid}", json=payload, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["title"]["en"] == "UPDATED TITLE"
        assert r.json()["overlay_opacity"] == 0.7

    def test_reorder_hero(self):
        id1 = TestHeroCMS.created.get("id1")
        id2 = TestHeroCMS.created.get("id2")
        if not (id1 and id2):
            pytest.skip("need two slides")
        # Reverse order
        r = requests.put(f"{API}/admin/hero/reorder", json={"ordered_ids": [id2, id1]},
                         headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, f"reorder failed: {r.status_code} {r.text}"
        g = requests.get(f"{API}/hero", timeout=15).json()
        only_ours = [s for s in g if s["id"] in (id1, id2)]
        assert only_ours[0]["id"] == id2
        assert only_ours[1]["id"] == id1

    def test_delete_hero_slide(self):
        for k in ("id1", "id2"):
            sid = TestHeroCMS.created.get(k)
            if not sid:
                continue
            r = requests.delete(f"{API}/admin/hero/{sid}", headers=ADMIN_HEADER, timeout=15)
            assert r.status_code == 200, r.text

    def test_delete_nonexistent_hero(self):
        r = requests.delete(f"{API}/admin/hero/does-not-exist", headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 404


# -------- Global CMS Text --------
class TestCMSText:
    def test_get_cms_defaults(self):
        r = requests.get(f"{API}/cms", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "items" in d
        keys = [it["key"] for it in d["items"]]
        for k in ("limited_edition", "handcrafted", "free_shipping", "hero_strapline"):
            assert k in keys, f"default cms key missing: {k}"
        # All values should have en/ru/lv
        for it in d["items"]:
            assert set(it["values"].keys()) >= {"en", "ru", "lv"}

    def test_update_cms_requires_admin(self):
        r = requests.put(f"{API}/admin/cms", json={"items": []}, timeout=15)
        assert r.status_code == 401

    def test_update_cms_replaces_items(self):
        new_items = [
            {"key": "limited_edition", "label": "Limited", "values": {"en": "TEST_EN", "ru": "TEST_RU", "lv": "TEST_LV"}},
            {"key": "handcrafted", "label": "Hand", "values": {"en": "Hand EN", "ru": "Hand RU", "lv": "Hand LV"}},
            {"key": "free_shipping", "label": "Ship", "values": {"en": "Ship EN", "ru": "Ship RU", "lv": "Ship LV"}},
            {"key": "hero_strapline", "label": "Strap", "values": {"en": "Strap EN", "ru": "Strap RU", "lv": "Strap LV"}},
        ]
        r = requests.put(f"{API}/admin/cms", json={"items": new_items}, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        # Verify GET reflects change
        g = requests.get(f"{API}/cms", timeout=15).json()
        le = next((it for it in g["items"] if it["key"] == "limited_edition"), None)
        assert le is not None
        assert le["values"]["en"] == "TEST_EN"
        assert le["values"]["ru"] == "TEST_RU"


# -------- Product status_label / stock_count --------
class TestProductStatusFields:
    created = {}

    def test_products_include_status_fields(self):
        r = requests.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert items
        first = items[0]
        assert "status_label" in first
        assert "stock_count" in first

    def test_create_product_with_status(self):
        payload = {
            "name": "TEST_iter3 Low Stock Tee",
            "description": "low stock",
            "price": 30.0,
            "category": "men",
            "product_type": "tshirt",
            "image_url": "https://example.com/x.jpg",
            "sizes": ["S", "M"],
            "colors": ["Black"],
            "in_stock": True,
            "featured": False,
            "status_label": "low_stock",
            "stock_count": 5,
        }
        r = requests.post(f"{API}/admin/products", json=payload, headers=ADMIN_HEADER, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status_label"] == "low_stock"
        assert d["stock_count"] == 5
        TestProductStatusFields.created["id"] = d["id"]

    def test_cleanup_test_product(self):
        pid = TestProductStatusFields.created.get("id")
        if pid:
            requests.delete(f"{API}/admin/products/{pid}", headers=ADMIN_HEADER, timeout=15)


# -------- Regression: critical existing endpoints --------
class TestRegression:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200

    def test_products_filter(self):
        r = requests.get(f"{API}/products?category=men", timeout=15)
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "men"

    def test_auth_me_unauth(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401
