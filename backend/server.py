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

    # Seed FAQs if none exist
    try:
        faq_count = await db.faqs.count_documents({})
        if faq_count == 0:
            for idx, f in enumerate(DEFAULT_FAQS):
                doc = {
                    "id": str(uuid.uuid4()),
                    "question": f["question"],
                    "answer": f["answer"],
                    "category": f.get("category", "general"),
                    "sort_order": idx,
                    "active": True,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                await db.faqs.insert_one(doc)
            logging.info("Seeded %d FAQs", len(DEFAULT_FAQS))
    except Exception as e:
        logging.warning("FAQ seed skipped: %s", e)


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
        "currency": "eur",
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
    "contact_email": "tunceltextile@gmail.com",
    "favicon_url": "https://customer-assets.emergentagent.com/job_tuncel-textile/artifacts/x9q410pf_WhatsApp_Image_2026-05-06_at_18.11.35-removebg-preview.png",
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
    "category_cards": [
        {"slug": "men", "to": "/shop/men", "image_url": "https://images.pexels.com/photos/2540152/pexels-photo-2540152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
         "title": {"en": "Men", "ru": "Мужчины", "lv": "Vīriešiem"}},
        {"slug": "women", "to": "/shop/women", "image_url": "https://images.pexels.com/photos/8945179/pexels-photo-8945179.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
         "title": {"en": "Women", "ru": "Женщины", "lv": "Sievietēm"}},
        {"slug": "accessories", "to": "/shop/accessories", "image_url": "https://images.pexels.com/photos/16039231/pexels-photo-16039231.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900",
         "title": {"en": "Accessories", "ru": "Аксессуары", "lv": "Aksesuāri"}},
    ],
}


class SettingsIn(BaseModel):
    whatsapp_number: Optional[str] = None
    whatsapp_default_message: Optional[str] = None
    contact_email: Optional[str] = None
    favicon_url: Optional[str] = None
    social: Optional[Dict[str, str]] = None
    iban: Optional[Dict[str, str]] = None
    category_cards: Optional[List[Dict]] = None


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
# ADMIN ORDERS (list + mark IBAN orders as paid)
# ============================================================
@api_router.get("/admin/orders")
async def admin_list_orders(_: bool = Depends(require_admin)):
    orders = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders


@api_router.post("/admin/orders/{reference}/mark-paid")
async def admin_mark_paid(reference: str, _: bool = Depends(require_admin)):
    res = await db.payment_transactions.update_one(
        {"$or": [{"reference": reference}, {"session_id": reference}]},
        {"$set": {"payment_status": "paid", "status": "complete", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


@api_router.post("/admin/orders/{reference}/mark-unpaid")
async def admin_mark_unpaid(reference: str, _: bool = Depends(require_admin)):
    res = await db.payment_transactions.update_one(
        {"$or": [{"reference": reference}, {"session_id": reference}]},
        {"$set": {"payment_status": "awaiting_bank_transfer", "status": "open", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


# ============================================================
# ORDER FULFILLMENT / TRACKING (Phase 2)
# ============================================================
FULFILLMENT_STATUSES = ["pending", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"]


class OrderLookupIn(BaseModel):
    reference: str
    email: EmailStr


def _public_order_view(doc: dict) -> dict:
    """Strip internal/sensitive fields; only return what customer needs to see."""
    return {
        "reference": doc.get("reference") or doc.get("session_id"),
        "customer_name": doc.get("customer_name"),
        "customer_email": doc.get("customer_email"),
        "amount": doc.get("amount"),
        "currency": doc.get("currency", "eur"),
        "payment_status": doc.get("payment_status"),
        "payment_method": doc.get("payment_method"),
        "fulfillment_status": doc.get("fulfillment_status", "pending"),
        "tracking_carrier": doc.get("tracking_carrier"),
        "tracking_number": doc.get("tracking_number"),
        "tracking_url": doc.get("tracking_url"),
        "shipping_note": doc.get("shipping_note"),
        "shipping_address": doc.get("shipping_address"),
        "items_summary": (doc.get("metadata") or {}).get("items", ""),
        "items": doc.get("items", []),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        "shipped_at": doc.get("shipped_at"),
        "delivered_at": doc.get("delivered_at"),
    }


@api_router.post("/order-lookup")
async def public_order_lookup(payload: OrderLookupIn):
    """Customer-facing order tracking — must provide reference + matching email."""
    ref = payload.reference.strip().upper()
    email = payload.email.strip().lower()
    doc = await db.payment_transactions.find_one(
        {"$or": [{"reference": ref}, {"session_id": ref}]},
        {"_id": 0},
    )
    if not doc:
        raise HTTPException(404, "Order not found")
    stored_email = (doc.get("customer_email") or "").strip().lower()
    if stored_email != email:
        # Don't reveal whether ref exists — same 404 message
        raise HTTPException(404, "Order not found")
    return _public_order_view(doc)


class OrderFulfillmentIn(BaseModel):
    fulfillment_status: Optional[str] = None
    tracking_carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    shipping_note: Optional[str] = None


@api_router.put("/admin/orders/{reference}/fulfillment")
async def admin_update_fulfillment(reference: str, payload: OrderFulfillmentIn, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "fulfillment_status" in update and update["fulfillment_status"] not in FULFILLMENT_STATUSES:
        raise HTTPException(400, f"Invalid status. Allowed: {', '.join(FULFILLMENT_STATUSES)}")
    now = datetime.now(timezone.utc).isoformat()
    update["updated_at"] = now
    if update.get("fulfillment_status") == "shipped":
        update["shipped_at"] = now
    if update.get("fulfillment_status") == "delivered":
        update["delivered_at"] = now
    res = await db.payment_transactions.update_one(
        {"$or": [{"reference": reference}, {"session_id": reference}]},
        {"$set": update},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Order not found")
    doc = await db.payment_transactions.find_one(
        {"$or": [{"reference": reference}, {"session_id": reference}]},
        {"_id": 0},
    )
    return _public_order_view(doc)


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
    {"key": "free_shipping", "label": "Free shipping tag", "values": {"en": "Complimentary shipping on orders over €30", "ru": "Бесплатная доставка от €30", "lv": "Bezmaksas piegāde no €30"}},
    {"key": "hero_strapline", "label": "Hero default strapline (used when no slides)", "values": {"en": "A two-person atelier crafting limited-run hoodies, tees and accessories.", "ru": "Маленькое ателье из двух мастеров, лимитированные тиражи худи, футболок и аксессуаров.", "lv": "Divu cilvēku ateljē — limitēti hūdiji, T-krekli un aksesuāri."}},
    {"key": "legal_privacy", "label": "Privacy Policy body", "values": {
        "en": "## Tuncel Textile · Privacy Policy\n\nWe collect only the data needed to process your order: your name, email, shipping address and order details. We never sell or rent personal data to third parties. Payment processing is handled by Stripe (card payments) and your bank (IBAN transfers) — we never see or store full card details.\n\n**What we keep**\n- Account and contact details\n- Order, payment status and shipping addresses\n- Optional chat/contact form messages\n\n**Your rights**\nYou may request a copy or deletion of your data at any time by writing to tunceltextile@gmail.com.\n\n**Updates**\nWe will revise this policy as our atelier grows. The latest version always lives at /legal/privacy.",
        "ru": "## Tuncel Textile · Политика конфиденциальности\n\nМы собираем только данные, необходимые для обработки заказа. Платежи обрабатывают Stripe и ваш банк — мы не храним данные карт.\n\nДля запроса копии или удаления данных напишите на tunceltextile@gmail.com.",
        "lv": "## Tuncel Textile · Privātuma politika\n\nMēs apkopojam tikai datus, kas nepieciešami pasūtījuma apstrādei. Maksājumus apstrādā Stripe un jūsu banka — mēs neglabājam karšu datus.\n\nLai pieprasītu kopiju vai datu dzēšanu, rakstiet uz tunceltextile@gmail.com.",
    }},
    {"key": "legal_terms_of_use", "label": "Terms of Use", "values": {
        "en": "## Terms of Use\n\nBy using tunceltextile.com you agree to use the site for lawful purposes only. Content, designs and photography are © Tuncel Textile and may not be reproduced without permission. We reserve the right to update these terms at any time.",
        "ru": "## Условия использования\n\nИспользуя сайт, вы соглашаетесь использовать его в законных целях. Контент защищён авторским правом Tuncel Textile.",
        "lv": "## Lietošanas noteikumi\n\nLietojot vietni, jūs piekrītat to izmantot likumīgiem mērķiem. Saturs aizsargāts ar Tuncel Textile autortiesībām.",
    }},
    {"key": "legal_terms_of_sale", "label": "Terms of Sale", "values": {
        "en": "## Terms of Sale\n\n**Orders** — All orders are subject to availability and acceptance. We may refuse or cancel any order at our sole discretion.\n\n**Pricing** — All prices are shown in Euro (€) and include applicable taxes unless stated otherwise. Shipping is free on orders over €30.\n\n**Payment** — We accept card payments via Stripe and direct IBAN bank transfers. IBAN orders ship within 24 hours of payment confirmation.\n\n**Shipping** — Pieces dispatch within 48 hours from our Riga atelier. Delivery times depend on destination.\n\n**Returns** — Limited editions are final sale. Standard pieces may be returned unworn within 14 days.\n\n**Liability** — Our liability is limited to the value of the order.",
        "ru": "## Условия продажи\n\nВсе заказы подлежат подтверждению. Цены указаны в евро (€). Бесплатная доставка от €30. Лимитированные выпуски возврату не подлежат.",
        "lv": "## Pārdošanas noteikumi\n\nVisi pasūtījumi tiek apstiprināti pēc to saņemšanas. Cenas ir EUR (€). Bezmaksas piegāde no €30. Limitētie izdevumi nav atgriežami.",
    }},
    {"key": "legal_imprint", "label": "Imprint", "values": {
        "en": "## Imprint\n\n**Tuncel Textile SIA**\nAtelier · Riga, Latvia\n\nEmail · tunceltextile@gmail.com\nWhatsApp · +371 20677937\n\nResponsible for content under EU regulations: Tuncel Textile founders.",
        "ru": "## Выходные данные\n\nTuncel Textile SIA · Рига, Латвия\nE-mail: tunceltextile@gmail.com",
        "lv": "## Impresums\n\nTuncel Textile SIA · Rīga, Latvija\nE-pasts: tunceltextile@gmail.com",
    }},
    {"key": "legal_accessibility", "label": "Accessibility Statement", "values": {
        "en": "## Accessibility Statement\n\nWe believe shopping should be effortless for everyone. We work to maintain WCAG 2.1 AA standards across the site: keyboard navigation, focus rings, alt text on all product imagery, and readable type. If you experience any barrier, please write to tunceltextile@gmail.com and we will respond within 48 hours.",
        "ru": "## Заявление о доступности\n\nМы стремимся к стандартам WCAG 2.1 AA. О любых проблемах сообщайте: tunceltextile@gmail.com.",
        "lv": "## Pieejamības paziņojums\n\nMēs ievērojam WCAG 2.1 AA standartus. Ja saskaras ar šķēršļiem, rakstiet uz tunceltextile@gmail.com.",
    }},
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


# ============================================================
# FAQ (admin-managed, multi-language)
# ============================================================
class FaqIn(BaseModel):
    question: Dict[str, str]
    answer: Dict[str, str]
    category: str = "general"
    sort_order: int = 0
    active: bool = True


@api_router.get("/faqs")
async def list_faqs():
    items = await db.faqs.find({"active": True}, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return items


@api_router.get("/admin/faqs")
async def admin_list_faqs(_: bool = Depends(require_admin)):
    return await db.faqs.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)


@api_router.post("/admin/faqs")
async def admin_create_faq(payload: FaqIn, _: bool = Depends(require_admin)):
    count = await db.faqs.count_documents({})
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["sort_order"] = doc.get("sort_order") or count
    doc["question"] = _lang_dict(doc["question"])
    doc["answer"] = _lang_dict(doc["answer"])
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.faqs.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.put("/admin/faqs/{faq_id}")
async def admin_update_faq(faq_id: str, payload: FaqIn, _: bool = Depends(require_admin)):
    update = payload.model_dump()
    update["question"] = _lang_dict(update["question"])
    update["answer"] = _lang_dict(update["answer"])
    res = await db.faqs.update_one({"id": faq_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "FAQ not found")
    return await db.faqs.find_one({"id": faq_id}, {"_id": 0})


@api_router.delete("/admin/faqs/{faq_id}")
async def admin_delete_faq(faq_id: str, _: bool = Depends(require_admin)):
    res = await db.faqs.delete_one({"id": faq_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "FAQ not found")
    return {"deleted": True}


# Seed default FAQs if none exist
DEFAULT_FAQS = [
    {"question": {"en": "How long until my order ships?", "ru": "Когда отправят мой заказ?", "lv": "Cik ilgā laikā tiks nosūtīts mans pasūtījums?"},
     "answer": {"en": "We dispatch from our Riga atelier within 48 hours of confirmed payment. Card orders confirm instantly; IBAN transfers confirm within 24 hours of receipt.",
                "ru": "Мы отправляем из нашего ателье в Риге в течение 48 часов после подтверждения платежа.",
                "lv": "Mēs nosūtām no mūsu ateljē Rīgā 48 stundu laikā pēc apstiprināta maksājuma."}, "category": "shipping"},
    {"question": {"en": "Do you offer free shipping?", "ru": "Есть ли бесплатная доставка?", "lv": "Vai ir bezmaksas piegāde?"},
     "answer": {"en": "Yes — complimentary shipping on all orders over €30, anywhere in the EU.",
                "ru": "Да, бесплатная доставка по ЕС от €30.",
                "lv": "Jā, bezmaksas piegāde ES virs €30."}, "category": "shipping"},
    {"question": {"en": "Can you make a custom piece for me?", "ru": "Можете ли вы сделать кастомную вещь?", "lv": "Vai jūs varat izgatavot pielāgotu apģērbu?"},
     "answer": {"en": "Yes. Use our Custom Request form to share your idea, references, quantities and budget. We respond within 24 hours with a quote.",
                "ru": "Да. Заполните форму индивидуального заказа.",
                "lv": "Jā. Aizpildiet pielāgota pasūtījuma formu."}, "category": "custom"},
    {"question": {"en": "What is your return policy?", "ru": "Какая у вас политика возврата?", "lv": "Kāda ir jūsu atgriešanas politika?"},
     "answer": {"en": "Standard pieces may be returned unworn within 14 days. Limited-edition drops and bespoke pieces are final sale.",
                "ru": "Обычные вещи можно вернуть в течение 14 дней. Лимитированные — без возврата.",
                "lv": "Standarta gabalus var atgriezt 14 dienu laikā. Limitētie izdevumi nav atgriežami."}, "category": "returns"},
    {"question": {"en": "Which payment methods do you accept?", "ru": "Какие способы оплаты вы принимаете?", "lv": "Kādas maksāšanas metodes pieņemat?"},
     "answer": {"en": "Card payments (Visa, Mastercard, AmEx via Stripe) and direct IBAN bank transfer. Both flows give you a unique order reference.",
                "ru": "Картой (через Stripe) и банковским переводом IBAN.",
                "lv": "Ar karti (Stripe) un IBAN pārskaitījumu."}, "category": "payment"},
]


# ============================================================
# CUSTOM REQUESTS (bespoke / custom apparel inquiries)
# ============================================================
class CustomRequestIn(BaseModel):
    customer_name: str
    email: EmailStr
    phone: Optional[str] = None
    product_type: str  # hoodie | tshirt | tote | other
    design_style: Optional[str] = None  # minimalist | typographic | graphic | mascot | other
    idea_description: str
    image_urls: List[str] = []
    print_placement: Optional[str] = None  # front | back | sleeve | chest | full
    primary_color: Optional[str] = None
    quantity: int = 1
    budget_range: Optional[str] = None
    contact_preference: Optional[str] = None  # email | whatsapp


@api_router.post("/custom-requests")
async def submit_custom_request(payload: CustomRequestIn):
    short_id = uuid.uuid4().hex[:6].upper()
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["reference"] = f"CR-{short_id}"
    doc["status"] = "new"  # new | reviewing | quoted | accepted | rejected | completed
    doc["admin_notes"] = ""
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.custom_requests.insert_one(doc)
    return {"reference": doc["reference"], "id": doc["id"], "status": doc["status"]}


@api_router.get("/admin/custom-requests")
async def admin_list_custom_requests(_: bool = Depends(require_admin)):
    return await db.custom_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


class CustomRequestStatusIn(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


@api_router.put("/admin/custom-requests/{request_id}")
async def admin_update_custom_request(request_id: str, payload: CustomRequestStatusIn, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.custom_requests.update_one({"id": request_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Request not found")
    return await db.custom_requests.find_one({"id": request_id}, {"_id": 0})


# ============================================================
# RETURNS / EXCHANGES (Phase 3)
# ============================================================
RETURN_STATUSES = ["pending", "approved", "rejected", "in_transit", "received", "refunded", "exchanged", "cancelled"]
RETURN_TYPES = ["refund", "exchange"]
RETURN_REASONS = ["size_too_small", "size_too_big", "not_as_described", "quality_issue", "wrong_item", "changed_mind", "other"]


class ReturnIn(BaseModel):
    order_reference: str
    email: EmailStr
    return_type: str  # refund | exchange
    reason: str
    description: str
    items: List[str] = []  # list of product names or product_ids from the order
    image_urls: List[str] = []
    exchange_size: Optional[str] = None
    iban_for_refund: Optional[str] = None


@api_router.post("/returns")
async def submit_return(payload: ReturnIn):
    ref = payload.order_reference.strip().upper()
    email = payload.email.strip().lower()
    if payload.return_type not in RETURN_TYPES:
        raise HTTPException(400, f"Invalid return_type. Allowed: {', '.join(RETURN_TYPES)}")
    if payload.reason not in RETURN_REASONS:
        raise HTTPException(400, f"Invalid reason. Allowed: {', '.join(RETURN_REASONS)}")
    if len(payload.description) > 4000:
        raise HTTPException(400, "Description too long (max 4000 chars)")

    order = await db.payment_transactions.find_one(
        {"$or": [{"reference": ref}, {"session_id": ref}]},
        {"_id": 0},
    )
    if not order:
        raise HTTPException(404, "Order not found. Please check the reference.")
    stored_email = (order.get("customer_email") or "").strip().lower()
    if stored_email != email:
        raise HTTPException(404, "Order not found. Please check the reference.")

    short_id = uuid.uuid4().hex[:6].upper()
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["reference"] = f"RT-{short_id}"
    doc["order_reference"] = ref
    doc["customer_name"] = order.get("customer_name")
    doc["status"] = "pending"
    doc["admin_notes"] = ""
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.returns.insert_one(doc)
    return {"reference": doc["reference"], "id": doc["id"], "status": doc["status"]}


@api_router.get("/admin/returns")
async def admin_list_returns(_: bool = Depends(require_admin)):
    return await db.returns.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


class ReturnStatusIn(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


@api_router.put("/admin/returns/{return_id}")
async def admin_update_return(return_id: str, payload: ReturnStatusIn, _: bool = Depends(require_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "status" in update and update["status"] not in RETURN_STATUSES:
        raise HTTPException(400, f"Invalid status. Allowed: {', '.join(RETURN_STATUSES)}")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.returns.update_one({"id": return_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Return not found")
    return await db.returns.find_one({"id": return_id}, {"_id": 0})


# ============================================================
# LIVE CHAT (Phase 4) — polling-based widget
# ============================================================
class ChatStartIn(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    initial_message: Optional[str] = None


class ChatMessageIn(BaseModel):
    body: str


@api_router.post("/chat/start")
async def chat_start(payload: ChatStartIn):
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": session_id,
        "customer_name": payload.customer_name or "Visitor",
        "customer_email": payload.customer_email,
        "status": "open",  # open | closed
        "last_customer_at": now,
        "last_admin_at": None,
        "unread_for_admin": 0,
        "unread_for_customer": 0,
        "created_at": now,
        "updated_at": now,
    }
    await db.chat_sessions.insert_one(doc)

    if payload.initial_message:
        msg = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "sender": "customer",
            "body": payload.initial_message[:4000],
            "created_at": now,
        }
        await db.chat_messages.insert_one(msg)
        await db.chat_sessions.update_one(
            {"id": session_id},
            {"$set": {"updated_at": now, "last_customer_at": now}, "$inc": {"unread_for_admin": 1}},
        )

    return {"session_id": session_id}


@api_router.post("/chat/{session_id}/message")
async def chat_send_message(session_id: str, payload: ChatMessageIn):
    sess = await db.chat_sessions.find_one({"id": session_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404, "Chat session not found")
    if sess.get("status") == "closed":
        raise HTTPException(400, "Chat is closed")
    if not payload.body or not payload.body.strip():
        raise HTTPException(400, "Empty message")
    body = payload.body.strip()[:4000]
    now = datetime.now(timezone.utc).isoformat()
    msg = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "sender": "customer",
        "body": body,
        "created_at": now,
    }
    await db.chat_messages.insert_one(msg)
    await db.chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"updated_at": now, "last_customer_at": now, "status": "open"}, "$inc": {"unread_for_admin": 1}},
    )
    return {k: v for k, v in msg.items() if k != "_id"}


@api_router.get("/chat/{session_id}/messages")
async def chat_get_messages(session_id: str, since: Optional[str] = None):
    sess = await db.chat_sessions.find_one({"id": session_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404, "Chat session not found")
    q = {"session_id": session_id}
    if since:
        q["created_at"] = {"$gt": since}
    msgs = await db.chat_messages.find(q, {"_id": 0}).sort("created_at", 1).to_list(500)
    # Mark customer's view as read (clear unread_for_customer)
    if not since:  # full fetch -> consider as opening the panel
        await db.chat_sessions.update_one({"id": session_id}, {"$set": {"unread_for_customer": 0}})
    return {
        "session": {
            "id": sess["id"],
            "status": sess.get("status", "open"),
            "customer_name": sess.get("customer_name"),
            "unread_for_customer": sess.get("unread_for_customer", 0),
        },
        "messages": msgs,
    }


@api_router.get("/admin/chat/sessions")
async def admin_chat_sessions(_: bool = Depends(require_admin)):
    sessions = await db.chat_sessions.find({}, {"_id": 0}).sort("updated_at", -1).to_list(500)
    return sessions


@api_router.get("/admin/chat/{session_id}")
async def admin_chat_session(session_id: str, _: bool = Depends(require_admin)):
    sess = await db.chat_sessions.find_one({"id": session_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404, "Chat session not found")
    msgs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    # Mark admin's view as read
    await db.chat_sessions.update_one({"id": session_id}, {"$set": {"unread_for_admin": 0}})
    return {"session": sess, "messages": msgs}


@api_router.post("/admin/chat/{session_id}/reply")
async def admin_chat_reply(session_id: str, payload: ChatMessageIn, _: bool = Depends(require_admin)):
    sess = await db.chat_sessions.find_one({"id": session_id}, {"_id": 0})
    if not sess:
        raise HTTPException(404, "Chat session not found")
    if not payload.body or not payload.body.strip():
        raise HTTPException(400, "Empty message")
    body = payload.body.strip()[:4000]
    now = datetime.now(timezone.utc).isoformat()
    msg = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "sender": "admin",
        "body": body,
        "created_at": now,
    }
    await db.chat_messages.insert_one(msg)
    await db.chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"updated_at": now, "last_admin_at": now, "status": "open"}, "$inc": {"unread_for_customer": 1}},
    )
    return {k: v for k, v in msg.items() if k != "_id"}


@api_router.put("/admin/chat/{session_id}/close")
async def admin_chat_close(session_id: str, _: bool = Depends(require_admin)):
    res = await db.chat_sessions.update_one(
        {"id": session_id},
        {"$set": {"status": "closed", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Chat session not found")
    return {"ok": True}


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
