"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id: number;
  title: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  increaseQuantity: (id: number) => void;
  decreaseQuantity: (id: number) => void;
};


const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wall-crawl-cart");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

    useEffect(() => {
    localStorage.setItem("wall-crawl-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(item: Omit<CartItem, "quantity">) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function increaseQuantity(id: number) {
  setCart((prev) =>
    prev.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
}

function decreaseQuantity(id: number) {
  setCart((prev) =>
    prev
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
}

  return (
    <CartContext.Provider value={{ cart, addToCart, increaseQuantity,decreaseQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
