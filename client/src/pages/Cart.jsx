import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, changeQty, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    if (!user) return navigate("/login");
    setBusy(true);
    setError("");
    try {
      await api.post("/orders", { items: cart.map((p) => ({ productId: p._id, qty: p.qty })) });
      clearCart();
      navigate("/orders");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (cart.length === 0)
    return (
      <div className="empty-state mx-auto mt-10 max-w-xl">
        <div className="mb-3 text-5xl" aria-hidden="true">🛍️</div>
        <p className="text-xl font-bold">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary mt-4 inline-block">Browse listings</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Your cart</h1>
      <div className="space-y-3">
        {cart.map((p) => (
          <div key={p._id} className="listing-row flex items-center gap-4 p-3">
            {p.image ? <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-line" />}
            <div className="flex-1">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-ink/60">₹{p.price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost !px-3 !py-1" onClick={() => changeQty(p._id, -1)}>-</button>
              <span className="w-6 text-center">{p.qty}</span>
              <button className="btn btn-ghost !px-3 !py-1" disabled={p.qty >= p.stock} onClick={() => changeQty(p._id, 1)}>+</button>
            </div>
            <p className="w-20 text-right font-bold">₹{p.price * p.qty}</p>
            <button className="text-sm text-brick hover:underline" onClick={() => removeFromCart(p._id)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="surface mt-6 flex items-center justify-between p-4">
        <p className="text-xl font-extrabold">Total: ₹{total}</p>
        <button className="btn btn-accent" onClick={checkout} disabled={busy}>
          {busy ? "Placing order..." : user ? "Place order" : "Log in to buy"}
        </button>
      </div>
      {user?.role === "seller" && <p className="mt-3 text-brick">Seller accounts can't buy. Please use a buyer account.</p>}
      {error && <p className="mt-3 text-brick">{error}</p>}
    </div>
  );
}
