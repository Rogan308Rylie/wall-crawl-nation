import PosterCard from "../../components/PosterCard";
import { posters } from "../../data/posters";


export default function ShopPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shop Posters</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posters.map((poster) => (
          <PosterCard
            key={poster.id}
            title={poster.title}
            price={poster.price}
          />
        ))}
      </div>
    </div>
  );
}
