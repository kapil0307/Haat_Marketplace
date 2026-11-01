import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import { CATEGORIES } from "./Home";

const empty = { title: "", price: "", stock: 1, category: "Other", image: "", description: "" };

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null); // id of the product being edited
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => {
    api.get("/products/mine").then((r) => setProducts(r.data)).catch((e) => setError(errMsg(e)));
    api.get("/orders/sales").then((r) => setSales(r.data)).catch((e) => setError(errMsg(e)));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editing) await api.put(`/products/${editing}`, body);
      else await api.post("/products", body);
      setForm(empty);
      setEditing(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({ title: p.title, price: p.price, stock: p.stock, category: p.category, image: p.image, description: p.description });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const updateSaleStatus = async (sale) => {
    const nextStatus = sale.status === "placed" ? "shipped" : "delivered";
    setError("");
    try {
      await api.put(`/orders/${sale.orderId}/items/${sale.productId}/status`, { status: nextStatus });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const earned = sales.reduce((s, x) => s + x.price * x.qty, 0);
  const itemsSold = sales.reduce((s, x) => s + x.qty, 0);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight">{editing ? "Edit listing" : "List a new item"}</h1>
        <form onSubmit={submit} className="surface grid gap-3 p-5 sm:grid-cols-2">
          <input className="field" placeholder="Title" required value={form.title} onChange={set("title")} />
          <input className="field" type="number" min="0" placeholder="Price (₹)" required value={form.price} onChange={set("price")} />
          <input className="field" type="number" min="0" placeholder="How many do you have?" required value={form.stock} onChange={set("stock")} />
          <select className="field" value={form.category} onChange={set("category")}>
            {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="field sm:col-span-2" placeholder="Photo link (paste an image URL)" value={form.image} onChange={set("image")} />
          <textarea className="field sm:col-span-2" rows={3} placeholder="Describe the item: condition, size, age" value={form.description} onChange={set("description")} />
          {error && <p className="text-brick sm:col-span-2">{error}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <button className="btn btn-primary">{editing ? "Save changes" : "Publish listing"}</button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-extrabold tracking-tight">Your listings ({products.length})</h2>
        {products.length === 0 && <p className="text-ink/60">You haven't listed anything yet. Use the form above.</p>}
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="listing-row flex items-center gap-4 p-3">
              {p.image ? <img src={p.image} alt="" className="h-14 w-14 rounded object-cover" /> : <div className="h-14 w-14 rounded bg-line" />}
              <div className="flex-1">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-ink/60">₹{p.price} · {p.stock > 0 ? `${p.stock} left` : "Sold out"}</p>
              </div>
              <button className="text-sm font-semibold underline" onClick={() => startEdit(p)}>Edit</button>
              <button className="text-sm text-brick hover:underline" onClick={() => remove(p._id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-2xl font-extrabold tracking-tight">Sales</h2>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="stat-card surface p-4">
            <p className="text-sm font-semibold text-ink/60">Total sales</p>
            <p className="mt-1 text-3xl font-extrabold text-brick">₹{earned}</p>
          </div>
          <div className="stat-card surface p-4">
            <p className="text-sm font-semibold text-ink/60">Items sold</p>
            <p className="mt-1 text-3xl font-extrabold">{itemsSold}</p>
          </div>
        </div>
        {sales.length === 0 && <p className="text-ink/60">No sales yet.</p>}
        <div className="space-y-2">
          {sales.map((s, i) => (
            <div key={`${s.orderId}-${s.productId}-${i}`} className="listing-row flex flex-col gap-3 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>{s.title} × {s.qty} bought by {s.buyer?.name}</span>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="rounded-full bg-line px-2.5 py-1 text-xs font-bold capitalize">{s.status || "placed"}</span>
                {s.status !== "delivered" && (
                  <button className="btn btn-ghost !px-3 !py-1 text-xs" onClick={() => updateSaleStatus(s)}>
                    {s.status === "shipped" ? "Mark as delivered" : "Mark as shipped"}
                  </button>
                )}
                <span className="font-bold">₹{s.price * s.qty}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
