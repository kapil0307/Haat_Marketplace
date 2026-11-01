import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errMsg } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate(user.role === "seller" ? "/dashboard" : "/");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form onSubmit={submit} className="auth-shell mx-auto mt-10 max-w-sm space-y-4">
      <p className="page-kicker">Join the community</p>
      <h1 className="relative text-3xl font-extrabold tracking-tight">Create your account</h1>
      <input className="field" placeholder="Full name" required value={form.name} onChange={set("name")} />
      <input className="field" type="email" placeholder="Email" required value={form.email} onChange={set("email")} />
      <input className="field" type="password" placeholder="Password (min 6 characters)" required minLength={6} value={form.password} onChange={set("password")} />
      <div className="grid grid-cols-2 gap-3">
        {[["buyer", "I want to buy"], ["seller", "I want to sell"]].map(([value, label]) => (
          <label
            key={value}
            className={`role-option cursor-pointer rounded-md border p-3 text-center text-sm font-semibold ${form.role === value ? "role-option-selected" : ""}`}
          >
            <input type="radio" name="role" value={value} checked={form.role === value} onChange={set("role")} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
      {error && <p className="text-brick">{error}</p>}
      <button className="btn btn-primary w-full">Sign up</button>
      <p className="text-sm text-ink/70">Already have an account? <Link to="/login" className="font-semibold underline">Log in</Link></p>
    </form>
  );
}
