"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CartItem = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wall-crawl-cart");
      if (!stored) return [];

      const parsed = JSON.parse(stored) as Array<Partial<CartItem>>;
      return parsed
        .filter((item): item is Partial<CartItem> & Pick<CartItem, "id" | "title" | "price" | "quantity"> =>
          Boolean(item.id && item.title && typeof item.price === "number" && typeof item.quantity === "number")
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imagePath: item.imagePath || "/posters/1.png",
        }));
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

  function increaseQuantity(id: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
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

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, increaseQuantity, decreaseQuantity, clearCart }}
    >
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
