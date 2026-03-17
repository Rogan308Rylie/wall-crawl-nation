"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem =
  | {
    type: "poster"
    id: string
    title: string
    price: number
    quantity: number
    imagePath: string
  }
  | {
    type: "collection"
    id: string
    title: string
    price: number
    quantity: number
    posterIds: string[]
    coverImage: string
  }

type CartContextType = {
  cart: CartItem[];
  addToCart: (item:
    | Omit<Extract<CartItem, { type: "poster" }>, "quantity">
    | Omit<Extract<CartItem, { type: "collection" }>, "quantity">
  ) => void;
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
        .filter((item): item is CartItem =>
          Boolean(item.id && item.title && typeof item.price === "number" && typeof item.quantity === "number" && item.type)
        )
        .map((item) => {
          if (item.type === "collection") {
            return {
              type: "collection" as const,
              id: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              posterIds: item.posterIds || [],
              coverImage: item.coverImage || "/posters/default-cover.jpg",
            };
          }
          return {
            type: "poster" as const,
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imagePath: item.imagePath || "/posters/1.png",
          };
        });
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("wall-crawl-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(item:
    | Omit<Extract<CartItem, { type: "poster" }>, "quantity">
    | Omit<Extract<CartItem, { type: "collection" }>, "quantity">
  ) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      // Both posters and collections stack quantities
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? ({ ...p, quantity: p.quantity + 1 } as CartItem) : p
        );
      }

      return [...prev, { ...item, quantity: 1 } as CartItem];
    });
  }

  function increaseQuantity(id: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? ({ ...item, quantity: item.quantity + 1 } as CartItem)
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? ({ ...item, quantity: item.quantity - 1 } as CartItem)
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
