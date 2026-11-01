import { useEffect, useState } from "react";
import api, { errMsg } from "../api";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders/mine").then((res) => setOrders(res.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <p className="text-brick">{error}</p>;
  if (!orders) return <p className="text-ink/60">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="page-heading">
        <div><p className="page-kicker">Your purchases</p><h1 className="text-3xl font-extrabold tracking-tight">My orders</h1></div>
      </div>
      {orders.length === 0 && <div className="empty-state"><p className="text-lg font-semibold">You haven't bought anything yet.</p></div>}
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="order-card p-4">
            <div className="flex justify-between text-sm text-ink/60">
              <span>{new Date(o.createdAt).toLocaleString()}</span>
              <span className="font-bold text-ink">₹{o.total}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{i.title} × {i.qty} <span className="ml-2 rounded-full bg-line px-2 py-0.5 text-xs font-semibold capitalize">{i.status || "placed"}</span></span>
                  <span>₹{i.price * i.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
