from fastapi import FastAPI, APIRouter, HTTPException, Request, Query, UploadFile, File, Header, Depends, Response, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    CheckoutSessionRequest,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "tuncel-admin-2026")
APP_NAME = os.environ.get("APP_NAME", "tuncel-textile")

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
storage_key: Optional[str] = None


def init_storage() -> Optional[str]:
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_LLM_KEY:
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logging.error("Storage init failed: %s", e)
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(503, "Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(503, "Storage not available")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ============================================================
# Shared auth dependency (used by /api/checkout/session and /api/orders)
# ============================================================
async def get_current_user(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
) -> Optional[dict]:
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return user

app = FastAPI(title="Tuncel Textile API")
api_router = APIRouter(prefix="/api")


# ---------------------------- Models ----------------------------
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str  # men | women | accessories
    product_type: str  # hoodie | tshirt | accessory
    image_url: str
    sizes: List[str] = []
    colors: List[str] = []
    in_stock: bool = True
    featured: bool = False
    print_name: Optional[str] = None
    stock_count: Optional[int] = None
    status_label: str = "in_stock"  # in_stock | low_stock | out_of_stock | coming_soon
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CartItemIn(BaseModel):
    product_id: str
    quantity: int = 1
    size: Optional[str] = None
    color: Optional[str] = None


class CheckoutRequest(BaseModel):
    items: List[CartItemIn]
    origin_url: str
    customer_email: Optional[str] = None


class CheckoutResponse(BaseModel):
    url: str
    session_id: str


class CheckoutStatusOut(BaseModel):
    session_id: str
    status: str
    payment_status: str
    amount_total: float
    currency: str


# ---------------------------- Seed Data ----------------------------
PEXELS = {
    "tshirt_black": "https://images.pexels.com/photos/36908588/pexels-photo-36908588.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "tshirts_grid": "https://images.pexels.com/photos/18265935/pexels-photo-18265935.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "men": "https://images.pexels.com/photos/2540152/pexels-photo-2540152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "women": "https://images.pexels.com/photos/8945179/pexels-photo-8945179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "accessories": "https://images.pexels.com/photos/16039231/pexels-photo-16039231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "hero": "https://images.pexels.com/photos/30816952/pexels-photo-30816952.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "hoodie_1": "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "hoodie_2": "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "tshirt_white": "https://images.pexels.com/photos/8217430/pexels-photo-8217430.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "woman_tee": "https://images.pexels.com/photos/5868729/pexels-photo-5868729.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "woman_hoodie": "https://images.pexels.com/photos/8217340/pexels-photo-8217340.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "cap": "https://images.pexels.com/photos/1078973/pexels-photo-1078973.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "tote": "https://images.pexels.com/photos/5705090/pexels-photo-5705090.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
    "chain": "https://images.pexels.com/photos/16039231/pexels-photo-16039231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1024&w=1024",
}

SEED_PRODUCTS = [
    # MEN — Hoodies
    {"name": "Static Noise Hoodie", "print_name": "STATIC / NOISE", "description": "Heavyweight 400gsm fleece hoodie with bold static-noise back print. Oversized fit.", "price": 89.0, "category": "men", "product_type": "hoodie", "image_url": PEXELS["hoodie_1"], "sizes": ["S","M","L","XL","XXL"], "colors": ["Black","Bone"], "featured": True},
    {"name": "Manifesto Hoodie", "print_name": "MANIFESTO 01", "description": "Manifesto print on chest and sleeves. Cotton blend fleece.", "price": 95.0, "category": "men", "product_type": "hoodie", "image_url": PEXELS["hoodie_2"], "sizes": ["S","M","L","XL"], "colors": ["Black"], "featured": False},
    # MEN — T-shirts
    {"name": "Tuncel Type Tee", "print_name": "TUNCEL / TYPE", "description": "Bold typography front print on heavy-knit cotton tee. Drop shoulder.", "price": 39.0, "category": "men", "product_type": "tshirt", "image_url": PEXELS["tshirt_black"], "sizes": ["S","M","L","XL"], "colors": ["Black","White"], "featured": True},
    {"name": "Edition One Tee", "print_name": "EDITION 01", "description": "Limited edition large-format back print. 100% organic cotton.", "price": 42.0, "category": "men", "product_type": "tshirt", "image_url": PEXELS["tshirt_white"], "sizes": ["S","M","L","XL"], "colors": ["White","Bone"], "featured": False},
    # WOMEN — Hoodies
    {"name": "Cropped Print Hoodie", "print_name": "CROP / 02", "description": "Cropped fit hoodie with metallic chest print. Brushed inside fleece.", "price": 85.0, "category": "women", "product_type": "hoodie", "image_url": PEXELS["woman_hoodie"], "sizes": ["XS","S","M","L"], "colors": ["Black","Stone"], "featured": True},
    {"name": "Boxy Statement Hoodie", "print_name": "STATEMENT", "description": "Boxy oversized hoodie with poetic statement print on the back.", "price": 92.0, "category": "women", "product_type": "hoodie", "image_url": PEXELS["women"], "sizes": ["XS","S","M","L","XL"], "colors": ["White","Black"], "featured": False},
    # WOMEN — T-shirts
    {"name": "Echo Tee", "print_name": "ECHO / ECHO", "description": "Soft cotton-modal tee with repeating echo type print. Slim fit.", "price": 38.0, "category": "women", "product_type": "tshirt", "image_url": PEXELS["woman_tee"], "sizes": ["XS","S","M","L"], "colors": ["White","Black","Stone"], "featured": True},
    {"name": "Frame Tee", "print_name": "FRAME 03", "description": "Boxy fit tee with framed print across the chest. Heavy cotton.", "price": 36.0, "category": "women", "product_type": "tshirt", "image_url": PEXELS["tshirts_grid"], "sizes": ["XS","S","M","L"], "colors": ["Black","White"], "featured": False},
    # ACCESSORIES
    {"name": "Print Cap", "print_name": "TXT", "description": "Six-panel cotton cap with embroidered Tuncel monogram.", "price": 29.0, "category": "accessories", "product_type": "accessory", "image_url": PEXELS["cap"], "sizes": ["One Size"], "colors": ["Black","Bone"], "featured": True},
    {"name": "Canvas Tote", "print_name": "TOTE / 01", "description": "Heavy canvas tote with large-format screen print on both sides.", "price": 25.0, "category": "accessories", "product_type": "accessory", "image_url": PEXELS["tote"], "sizes": ["One Size"], "colors": ["Natural"], "featured": False},
    {"name": "Chain Necklace", "print_name": "CHAIN", "description": "Stainless steel statement chain necklace. Edgy minimalism.", "price": 49.0, "category": "accessories", "product_type": "accessory", "image_url": PEXELS["chain"], "sizes": ["One Size"], "colors": ["Silver"], "featured": False},
]


@app.on_event("startup")
async def seed_products():
    init_storage()
    count = await db.products.count_documents({})
    if count == 0:
        for p in SEED_PRODUCTS:
            doc = Product(**p).model_dump()
            doc["created_at"] = doc["created_at"].isoformat()
            await db.products.insert_one(doc)
        logging.info("Seeded %d products", len(SEED_PRODUCTS))


# ---------------------------- Product Routes ----------------------------
@api_router.get("/")
async def root():
    return {"message": "Tuncel Textile API"}


@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = Query(None),
    product_type: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
):
    q: Dict = {}
    if category and category != "all":
        q["category"] = category
    if product_type:
        q["product_type"] = product_type
    if featured is not None:
        q["featured"] = featured
    items = await db.products.find(q, {"_id": 0}).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Product not found")
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


# ---------------------------- Stripe Checkout ----------------------------
@api_router.post("/checkout/session", response_model=CheckoutResponse)
async def create_checkout(req: CheckoutRequest, http_request: Request, user: Optional[dict] = Depends(get_current_user)):
    if not req.items:
        raise HTTPException(400, "Cart is empty")

    # Server-side price calculation (never trust frontend)
    total = 0.0
    line_meta = []
    for item in req.items:
        prod = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not prod:
            raise HTTPException(400, f"Product {item.product_id} not found")
        qty = max(1, int(item.quantity))
        total += float(prod["price"]) * qty
        line_meta.append(f"{prod['name']} x{qty}")

    total = round(total, 2)
    if total <= 0:
        raise HTTPException(400, "Invalid order total")

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    success_url = f"{req.origin_url.rstrip('/')}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url.rstrip('/')}/cart"

    metadata = {
        "source": "tuncel_textile_web",
        "items": " | ".join(line_meta)[:480],
    }
    if req.customer_email:
        metadata["customer_email"] = req.customer_email

    checkout_request = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)

    # Create payment_transactions entry BEFORE redirect
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": total,
        "currency": "usd",
        "metadata": metadata,
        "items": [it.model_dump() for it in req.items],
        "customer_email": req.customer_email or (user.get("email") if user else None),
        "user_id": user.get("user_id") if user else None,
        "payment_status": "initiated",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(transaction)

    return CheckoutResponse(url=session.url, session_id=session.session_id)


@api_router.get("/checkout/status/{session_id}", response_model=CheckoutStatusOut)
async def checkout_status(session_id: str, http_request: Request):
    existing = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Transaction not found")

    # If already finalized, return immediately
    if existing.get("payment_status") in ("paid", "failed", "expired"):
        return CheckoutStatusOut(
            session_id=session_id,
            status=existing.get("status", "complete"),
            payment_status=existing["payment_status"],
            amount_total=float(existing.get("amount", 0)),
            currency=existing.get("currency", "usd"),
        )

    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logging.warning("Stripe status lookup failed for %s: %s", session_id, e)
        # Gracefully fall back to the DB-cached record so the polling UI keeps working
        return CheckoutStatusOut(
            session_id=session_id,
            status=existing.get("status", "open"),
            payment_status=existing.get("payment_status", "pending"),
            amount_total=float(existing.get("amount", 0)),
            currency=existing.get("currency", "usd"),
        )

    new_payment_status = status.payment_status
    new_status = status.status

    update = {
        "payment_status": new_payment_status,
        "status": new_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$nin": ["paid", "failed", "expired"]}},
        {"$set": update},
    )

    return CheckoutStatusOut(
        session_id=session_id,
        status=new_status,
        payment_status=new_payment_status,
        amount_total=float(status.amount_total) / 100.0 if status.amount_total else float(existing.get("amount", 0)),
        currency=status.currency or "usd",
    )


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        logging.error("Webhook handling failed: %s", e)
        raise HTTPException(400, "Invalid webhook")

    if webhook_response and webhook_response.session_id:
        await db.payment_transactions.update_one(
            {"session_id": webhook_response.session_id, "payment_status": {"$nin": ["paid", "failed", "expired"]}},
            {"$set": {
                "payment_status": webhook_response.payment_status or "unknown",
                "event_type": webhook_response.event_type,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
    return {"received": True}


# ============================================================
# ADMIN AUTH (simple password)
# ============================================================
class AdminLogin(BaseModel):
    password: str


def require_admin(x_admin_token: Optional[str] = Header(None)):
    if not x_admin_token or x_admin_token != ADMIN_PASSWORD:
        raise HTTPException(401, "Admin auth required")
    return True


@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin):
    if payload.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid password")
    return {"token": ADMIN_PASSWORD}


# ============================================================
# IMAGE UPLOAD (admin only)
# ============================================================
@api_router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), _: bool = Depends(require_admin)):
    ext = (file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "bin").lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(400, "Unsupported file type")
    content_type = file.content_type or f"image/{'jpeg' if ext == 'jpg' else ext}"
    path = f"{APP_NAME}/products/{uuid.uuid4()}.{ext}"
    data = await file.read()
    put_object(path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": path,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": len(data),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Return a relative URL — frontend prepends REACT_APP_BACKEND_URL.
    return {"path": path, "url": f"/api/files/{path}"}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(404, "File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))


# ============================================================
# ADMIN PRODUCT CRUD
# ============================================================
class ProductIn(BaseModel):
    name: str
    description: str
    price: float
    category: str
    product_type: str
    image_url: str
    sizes: List[str] = []
    colors: List[str] = []
    in_stock: bool = True
    featured: bool = False
    print_name: Optional[str] = None
    stock_count: Optional[int] = None
    status_label: str = "in_stock"


@api_router.post("/admin/products", response_model=Product)
async def admin_create_product(payload: ProductIn, _: bool = Depends(require_admin)):
    product = Product(**payload.model_dump())
    doc = product.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.products.insert_one(doc)
    return product


@api_router.put("/admin/products/{product_id}", response_model=Product)
async def admin_update_product(product_id: str, payload: ProductIn, _: bool = Depends(require_admin)):
    update = payload.model_dump()
    res = await db.products.update_one({"id": product_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return doc


@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, _: bool = Depends(require_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"deleted": True}


# ============================================================
# GOOGLE AUTH (Emergent-managed)
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
# ============================================================
class SessionIn(BaseModel):
    session_id: str


@api_router.post("/auth/session")
async def auth_session(payload: SessionIn, response: Response):
    try:
        r = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        logging.error("Auth session lookup failed: %s", e)
        raise HTTPException(401, "Invalid session")

    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not (email and session_token):
        raise HTTPException(401, "Invalid session payload")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture}


@api_router.get("/auth/me")
async def auth_me(user: Optional[dict] = Depends(get_current_user)):
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


@api_router.post("/auth/logout")
async def auth_logout(
    response: Response,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
):
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ============================================================
# ORDERS (linked to user when authenticated)
# ============================================================
@api_router.get("/orders")
async def list_orders(user: Optional[dict] = Depends(get_current_user)):
    if not user:
        raise HTTPException(401, "Not authenticated")
    orders = await db.payment_transactions.find(
        {"user_id": user["user_id"], "payment_status": "paid"},
        {"_id": 0},
    ).sort("created_at", -1).to_list(200)
    return orders


# ============================================================
# SITE SETTINGS (admin-editable site-wide config)
# ============================================================
DEFAULT_SETTINGS = {
    "id": "default",
    "whatsapp_number": "+371 20677937",
    "whatsapp_default_message": "Hello Tuncel Textile, I'm interested in your collection.",
    "favicon_url": "",
    "social": {
        "instagram": "",
        "facebook": "",
        "twitter": "",
        "linkedin": "",
        "youtube": "",
        "tiktok": "",
    },
    "iban": {
        "bank_name": "Swedbank AS",
        "account_holder": "Tuncel Textile SIA",
        "iban": "",
        "bic": "",
        "reference_prefix": "TT",
        "instructions": "Please use the order reference below in your transfer description. Your order will ship within 24h of payment confirmation.",
    },
}


class SettingsIn(BaseModel):
    whatsapp_number: Optional[str] = None
    whatsapp_default_message: Optional[str] = None
    favicon_url: Optional[str] = None
    social: Optional[Dict[str, str]] = None
    iban: Optional[Dict[str, str]] = None


async def get_settings_doc() -> dict:
    doc = await db.site_settings.find_one({"id": "default"}, {"_id": 0})
    if not doc:
        await db.site_settings.insert_one(dict(DEFAULT_SETTINGS))
        return dict(DEFAULT_SETTINGS)
    # backfill missing keys from defaults
    for k, v in DEFAULT_SETTINGS.items():
        if k not in doc:
            doc[k] = v
        elif isinstance(v, dict):
            doc[k] = {**v, **(doc.get(k) or {})}
    return doc


@api_router.get("/settings")
async def get_settings():
    return await get_settings_doc()


@api_router.put("/admin/settings")
async def update_settings(payload: SettingsIn, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    await db.site_settings.update_one({"id": "default"}, {"$set": update}, upsert=True)
    return await get_settings_doc()


# ============================================================
# IBAN CHECKOUT (alternative to Stripe)
# ============================================================
class IbanCheckoutRequest(BaseModel):
    items: List[CartItemIn]
    customer_email: EmailStr
    customer_name: str
    shipping_address: Optional[str] = None
    note: Optional[str] = None


@api_router.post("/checkout/iban")
async def create_iban_order(req: IbanCheckoutRequest, user: Optional[dict] = Depends(get_current_user)):
    if not req.items:
        raise HTTPException(400, "Cart is empty")

    total = 0.0
    line_meta = []
    for item in req.items:
        prod = await db.products.find_one({"id": item.product_id}, {"_id": 0})
        if not prod:
            raise HTTPException(400, f"Product {item.product_id} not found")
        qty = max(1, int(item.quantity))
        total += float(prod["price"]) * qty
        line_meta.append(f"{prod['name']} x{qty}")

    total = round(total, 2)
    if total <= 0:
        raise HTTPException(400, "Invalid order total")

    settings = await get_settings_doc()
    iban_cfg = settings.get("iban", {}) or {}
    prefix = iban_cfg.get("reference_prefix", "TT")
    short_id = uuid.uuid4().hex[:6].upper()
    reference = f"{prefix}-{short_id}"

    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": reference,  # reuse session_id field for unique lookup
        "reference": reference,
        "amount": total,
        "currency": "eur",
        "metadata": {"items": " | ".join(line_meta)[:480], "customer_name": req.customer_name},
        "items": [it.model_dump() for it in req.items],
        "customer_email": req.customer_email,
        "customer_name": req.customer_name,
        "shipping_address": req.shipping_address,
        "note": req.note,
        "user_id": user.get("user_id") if user else None,
        "payment_status": "awaiting_bank_transfer",
        "status": "open",
        "payment_method": "iban",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(transaction)

    return {
        "reference": reference,
        "amount": total,
        "currency": "eur",
        "iban": iban_cfg,
        "items_summary": " | ".join(line_meta),
    }


@api_router.get("/checkout/iban/{reference}")
async def get_iban_order(reference: str):
    doc = await db.payment_transactions.find_one(
        {"reference": reference}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(404, "Order not found")
    settings = await get_settings_doc()
    return {
        "reference": doc.get("reference"),
        "amount": doc.get("amount"),
        "currency": doc.get("currency", "eur"),
        "payment_status": doc.get("payment_status"),
        "items_summary": (doc.get("metadata") or {}).get("items", ""),
        "iban": settings.get("iban", {}),
    }


# ============================================================
# HERO SLIDES (CMS - homepage hero manager)
# ============================================================
LANG_KEYS = ["en", "ru", "lv"]


def _lang_dict(value):
    if isinstance(value, dict):
        return {k: value.get(k, "") for k in LANG_KEYS}
    return {k: "" for k in LANG_KEYS}


class HeroSlideIn(BaseModel):
    image_url: str = ""
    mobile_image_url: str = ""
    video_url: str = ""
    kicker: Dict[str, str] = Field(default_factory=lambda: {k: "" for k in LANG_KEYS})
    title: Dict[str, str] = Field(default_factory=lambda: {k: "" for k in LANG_KEYS})
    subtitle: Dict[str, str] = Field(default_factory=lambda: {k: "" for k in LANG_KEYS})
    cta_label: Dict[str, str] = Field(default_factory=lambda: {k: "" for k in LANG_KEYS})
    cta_url: str = "/shop/all"
    blur_enabled: bool = True
    overlay_opacity: float = 0.45
    active: bool = True
    sort_order: int = 0


@api_router.get("/hero")
async def list_hero_slides():
    slides = await db.hero_slides.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    return slides


@api_router.get("/admin/hero")
async def admin_list_hero(_: bool = Depends(require_admin)):
    return await db.hero_slides.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@api_router.post("/admin/hero")
async def admin_create_hero(payload: HeroSlideIn, _: bool = Depends(require_admin)):
    count = await db.hero_slides.count_documents({})
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["sort_order"] = payload.sort_order if payload.sort_order else count
    doc["kicker"] = _lang_dict(doc["kicker"])
    doc["title"] = _lang_dict(doc["title"])
    doc["subtitle"] = _lang_dict(doc["subtitle"])
    doc["cta_label"] = _lang_dict(doc["cta_label"])
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.hero_slides.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


class HeroReorderIn(BaseModel):
    ordered_ids: List[str]


# NOTE: This static route MUST be registered BEFORE /admin/hero/{slide_id}
# otherwise FastAPI will match "reorder" as a slide_id and return 404.
@api_router.put("/admin/hero/reorder")
async def admin_reorder_hero(payload: HeroReorderIn, _: bool = Depends(require_admin)):
    for idx, sid in enumerate(payload.ordered_ids):
        await db.hero_slides.update_one({"id": sid}, {"$set": {"sort_order": idx}})
    return {"ok": True}


@api_router.put("/admin/hero/{slide_id}")
async def admin_update_hero(slide_id: str, payload: HeroSlideIn, _: bool = Depends(require_admin)):
    update = payload.model_dump()
    update["kicker"] = _lang_dict(update["kicker"])
    update["title"] = _lang_dict(update["title"])
    update["subtitle"] = _lang_dict(update["subtitle"])
    update["cta_label"] = _lang_dict(update["cta_label"])
    res = await db.hero_slides.update_one({"id": slide_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Slide not found")
    doc = await db.hero_slides.find_one({"id": slide_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/hero/{slide_id}")
async def admin_delete_hero(slide_id: str, _: bool = Depends(require_admin)):
    res = await db.hero_slides.delete_one({"id": slide_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Slide not found")
    return {"deleted": True}


# ============================================================
# CMS TEXT (editable global strings, multi-language)
# ============================================================
DEFAULT_CMS_ITEMS = [
    {"key": "limited_edition", "label": "Limited edition tag", "values": {"en": "Limited edition · numbered & signed", "ru": "Лимитированный выпуск · с номером и подписью", "lv": "Limitēts izdevums · numurēts un parakstīts"}},
    {"key": "handcrafted", "label": "Handcrafted tag", "values": {"en": "Hand-finished in our atelier", "ru": "Ручная финишная работа в нашем ателье", "lv": "Roku darbs mūsu ateljē"}},
    {"key": "free_shipping", "label": "Free shipping tag", "values": {"en": "Complimentary shipping over €120", "ru": "Бесплатная доставка от €120", "lv": "Bezmaksas piegāde no €120"}},
    {"key": "hero_strapline", "label": "Hero default strapline (used when no slides)", "values": {"en": "A two-person atelier crafting limited-run hoodies, tees and accessories.", "ru": "Маленькое ателье из двух мастеров, лимитированные тиражи худи, футболок и аксессуаров.", "lv": "Divu cilvēku ateljē — limitēti hūdiji, T-krekli un aksesuāri."}},
]


async def get_cms_doc() -> dict:
    doc = await db.cms_text.find_one({"id": "default"}, {"_id": 0})
    if not doc:
        doc = {"id": "default", "items": DEFAULT_CMS_ITEMS}
        await db.cms_text.insert_one(dict(doc))
    return doc


@api_router.get("/cms")
async def get_cms():
    return await get_cms_doc()


class CmsItemIn(BaseModel):
    key: str
    label: Optional[str] = ""
    values: Dict[str, str]


class CmsIn(BaseModel):
    items: List[CmsItemIn]


@api_router.put("/admin/cms")
async def update_cms(payload: CmsIn, _: bool = Depends(require_admin)):
    items = []
    for it in payload.items:
        items.append({"key": it.key, "label": it.label or "", "values": _lang_dict(it.values)})
    await db.cms_text.update_one({"id": "default"}, {"$set": {"items": items}}, upsert=True)
    return await get_cms_doc()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
