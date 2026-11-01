import { Link } from "react-router-dom";

export const Placeholder = ({ className = "" }) => (
  <div className={`flex items-center justify-center bg-line text-sm text-ink/50 ${className}`}>No photo</div>
);

export default function ProductCard({ product }) {
  const soldOut = product.stock < 1;
  return (
    <Link to={`/product/${product._id}`} className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      {product.image ? (
        <img src={product.image} alt={product.title} className="h-52 w-full object-cover" />
      ) : (
        <Placeholder className="h-52 w-full" />
      )}
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold group-hover:text-brick">{product.title}</h3>
        <p className="mt-1 text-xl font-extrabold">₹{product.price}</p>
        {product.ratingCount > 0 && <p className="mt-1 text-sm font-semibold text-marigold">★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})</p>}
        <p className="mt-1 text-sm text-ink/60">
          {product.seller?.name ? `Sold by ${product.seller.name}` : ""}
          {soldOut && <span className="ml-2 font-semibold text-brick">Sold out</span>}
        </p>
      </div>
    </Link>
  );
}
