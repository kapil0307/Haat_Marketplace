import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import ProductCard from "../components/ProductCard";

export const CATEGORIES = ["All", "Electronics", "Clothing", "Books", "Furniture", "Other"];

const promos = [
  {
    eyebrow: "Tech refresh",
    title: "Smart finds,\nsmall prices.",
    label: "Explore electronics",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    className: "from-[#12233f] via-[#174b68] to-[#56b3b0]",
  },
  {
    eyebrow: "Style edit",
    title: "Your next\nfavourite fit.",
    label: "Shop clothing",
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    className: "from-[#7d2f3d] via-[#bc5e4d] to-[#f0b37e]",
  },
  {
    eyebrow: "Second-hand gems",
    title: "Stories worth\nbringing home.",
    label: "Browse furniture",
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85",
    className: "from-[#3a2a27] via-[#795548] to-[#d1a878]",
  },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-fetch when the search text or category changes (with a short delay while typing)
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api
        .get("/products", { params: { search, category, sort, page, limit: 12 } })
        .then((res) => {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages);
          setError("");
        })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, category, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  return (
    <div>
      <section className="hero-panel relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 md:py-14">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-marigold">Your neighbourhood marketplace</p>
          <h1 className="max-w-xl text-4xl font-extrabold leading-[0.98] tracking-tight text-white md:text-6xl">
            Great finds are closer than you think.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75 md:text-lg">
            Discover pre-loved treasures, support local sellers, and give good things a second life.
          </p>
          <div className="relative mt-8 max-w-xl">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink/45">⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a phone, a jacket, a textbook..."
              className="field !rounded-xl !border-0 !py-4 !pl-11 pr-4 shadow-xl"
            />
          </div>
        </div>
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
      </section>

      <section className="mt-8 flex min-w-0 flex-col items-start gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brick">Browse by vibe</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">What are you looking for?</h2>
        </div>
        <div className="category-scroll flex w-full min-w-0 gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`category-chip shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                category === c ? "category-chip-selected shadow-md" : "border-line bg-white hover:-translate-y-0.5 hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid min-w-0 gap-4 md:grid-cols-3">
        {promos.map((promo) => (
          <button
            type="button"
            key={promo.title}
            onClick={() => setCategory(promo.category)}
            className={`promo-card group relative min-h-64 overflow-hidden rounded-2xl bg-gradient-to-br text-left ${promo.className}`}
          >
            <img src={promo.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen transition duration-500 group-hover:scale-105 group-hover:opacity-45" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="relative flex h-full min-h-64 flex-col justify-between p-5 text-white">
              <span className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">{promo.eyebrow}</span>
              <div>
                <h3 className="whitespace-pre-line text-2xl font-extrabold leading-tight">{promo.title}</h3>
                <span className="mt-3 inline-block text-sm font-semibold text-white/85">{promo.label} <span aria-hidden="true">→</span></span>
              </div>
            </div>
          </button>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brick">Fresh from the community</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Latest listings</h2>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="hidden text-ink/55 sm:inline">Sort by</span>
            <select className="field !w-auto !py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </section>

      {loading && <p className="text-ink/60">Loading listings...</p>}
      {error && <p className="text-brick">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="text-ink/60">Nothing listed here yet. Sellers can add items from their shop page.</p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {!loading && !error && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
