import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { CmsProvider } from "@/contexts/CmsContext";
import { Navbar } from "@/components/Navbar";
import { Footer, WhatsappFAB } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { ChatWidget } from "@/components/ChatWidget";
import { ShippingBar } from "@/components/ShippingBar";
import ScrollToTop from "@/components/ScrollToTop";
import { useFavicon } from "@/hooks/useFavicon";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import Account from "@/pages/Account";
import AuthCallback from "@/pages/AuthCallback";
import CookiePolicy from "@/pages/CookiePolicy";
import IbanSuccess from "@/pages/IbanSuccess";
import FAQ from "@/pages/FAQ";
import LegalPage from "@/pages/LegalPage";
import CustomRequest from "@/pages/CustomRequest";
import TrackOrder from "@/pages/TrackOrder";
import ReturnRequest from "@/pages/ReturnRequest";
import GiftCards from "@/pages/GiftCards";

function FaviconBridge() {
  const { settings } = useSettings();
  useFavicon(settings?.favicon_url);
  return null;
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop/:category" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout/success" element={<CheckoutSuccess />} />
      <Route path="/checkout/iban-success" element={<IbanSuccess />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/custom-request" element={<CustomRequest />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/return-request" element={<ReturnRequest />} />
      <Route path="/gift-cards" element={<GiftCards />} />
      <Route path="/legal/:slug" element={<LegalPage />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

function App() {
  return (
    <I18nProvider>
      <SettingsProvider>
        <CmsProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToTop />
                <FaviconBridge />
                <div className="App flex min-h-screen flex-col bg-white text-black">
                  <Navbar />
                  <main className="flex-1">
                    <AppRouter />
                  </main>
                  <Footer />
                  <WhatsappFAB />
                  <ChatWidget />
                  <CookieBanner />
                  <Toaster position="bottom-center" />
                </div>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </CmsProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}

export default App;
