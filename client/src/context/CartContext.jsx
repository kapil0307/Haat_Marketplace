import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Quantity can never go above the stock the seller has listed
  const addToCart = (product, qty = 1) =>
    setCart((prev) => {
      const found = prev.find((p) => p._id === product._id);
      if (found)
        return prev.map((p) => (p._id === product._id ? { ...p, qty: Math.min(p.qty + qty, product.stock) } : p));
      return [...prev, { _id: product._id, title: product.title, price: product.price, image: product.image, stock: product.stock, qty: Math.min(qty, product.stock) }];
    });

  const changeQty = (id, delta) =>
    setCart((prev) =>
      prev
        .map((p) => (p._id === id ? { ...p, qty: Math.min(p.stock, Math.max(0, p.qty + delta)) } : p))
        .filter((p) => p.qty > 0)
    );

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p._id !== id));
  const clearCart = () => setCart([]);
  const count = cart.reduce((n, p) => n + p.qty, 0);
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQty, removeFromCart, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  );
}
