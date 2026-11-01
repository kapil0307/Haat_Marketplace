import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errMsg } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "seller" ? "/dashboard" : "/");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form onSubmit={submit} className="auth-shell mx-auto mt-10 max-w-sm space-y-4">
      <p className="page-kicker">Welcome back</p>
      <h1 className="relative text-3xl font-extrabold tracking-tight">Log in to Haat</h1>
      <input className="field" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="field" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="text-brick">{error}</p>}
      <button className="btn btn-primary w-full">Log in</button>
      <p className="text-sm text-ink/70">New here? <Link to="/register" className="font-semibold underline">Create an account</Link></p>
    </form>
  );
}
