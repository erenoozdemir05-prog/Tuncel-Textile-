import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "tuncel_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, { size = null, color = null, quantity = 1 } = {}) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (it) => it.product_id === product.id && it.size === size && it.color === color
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          size,
          color,
          quantity,
        },
      ];
    });
  };

  const updateQty = (key, qty) => {
    setItems((prev) =>
      prev.map((it) =>
        cartKey(it) === key ? { ...it, quantity: Math.max(1, qty) } : it
      )
    );
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((it) => cartKey(it) !== key));
  };

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const count = items.reduce((sum, it) => sum + it.quantity, 0);
    return { subtotal: Number(subtotal.toFixed(2)), count };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear, totals }}>
      {children}
    </CartContext.Provider>
  );
};

export const cartKey = (it) => `${it.product_id}|${it.size || ""}|${it.color || ""}`;

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
