import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Placeholder } from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const loadReviews = () => api.get(`/products/${id}/reviews`).then((res) => setReviews(res.data)).catch((e) => setReviewError(errMsg(e)));

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data)).catch((e) => setError(errMsg(e)));
    loadReviews();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewBusy(true);
    setReviewError("");
    try {
      await api.post(`/products/${id}/reviews`, { ...reviewForm, rating: Number(reviewForm.rating) });
      const [productResponse] = await Promise.all([
        api.get(`/products/${id}`),
        loadReviews(),
      ]);
      setProduct(productResponse.data);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      setReviewError(errMsg(err));
    } finally {
      setReviewBusy(false);
    }
  };

  if (error) return <p className="text-brick">{error}</p>;
  if (!product) return <p className="text-ink/60">Loading...</p>;

  const soldOut = product.stock < 1;
  const isSeller = user?.role === "seller";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {product.image ? (
        <img src={product.image} alt={product.title} className="h-96 w-full rounded-lg border border-line object-cover" />
      ) : (
        <Placeholder className="h-96 w-full rounded-lg" />
      )}
      <div className="detail-panel p-6">
        <p className="text-sm text-ink/60">{product.category}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{product.title}</h1>
        {product.ratingCount > 0 && <p className="mt-2 font-semibold text-marigold">★ {product.ratingAvg.toFixed(1)} ({product.ratingCount} reviews)</p>}
        <p className="mt-3 text-3xl font-extrabold">₹{product.price}</p>
        <p className="mt-4 whitespace-pre-line text-ink/80">{product.description || "No description added."}</p>
        <p className="mt-4 text-sm text-ink/60">
          Sold by {product.seller?.name} · {soldOut ? "Sold out" : `${product.stock} available`}
        </p>

        {isSeller ? (
          <p className="mt-6 text-sm text-ink/60">You are logged in as a seller. Use a buyer account to purchase.</p>
        ) : (
          <div className="mt-6 flex gap-3">
            <button
              className="btn btn-accent"
              disabled={soldOut}
              onClick={() => {
                addToCart(product);
                setAdded(true);
              }}
            >
              Add to cart
            </button>
            {added && (
              <button className="btn btn-ghost" onClick={() => navigate("/cart")}>
                Go to cart
              </button>
            )}
          </div>
        )}
      </div>
      <section className="md:col-span-2">
        <h2 className="text-2xl font-extrabold tracking-tight">Reviews</h2>
        {user?.role === "buyer" && (
          <form onSubmit={submitReview} className="surface mt-4 p-4">
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold">
                Rating
                <select className="field !w-auto !py-2" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                </select>
              </label>
            </div>
            <textarea className="field mt-3" rows={3} maxLength={500} placeholder="Share your experience (optional)" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            {reviewError && <p className="mt-2 text-brick">{reviewError}</p>}
            <button className="btn btn-primary mt-3" disabled={reviewBusy}>{reviewBusy ? "Posting..." : "Post review"}</button>
          </form>
        )}
        {reviews.length === 0 && <p className="mt-4 text-ink/60">No reviews yet.</p>}
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="review-card p-4">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{review.buyer?.name}</p>
                <span className="font-semibold text-marigold">{"★".repeat(review.rating)}</span>
              </div>
              {review.comment && <p className="mt-2 text-ink/75">{review.comment}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
