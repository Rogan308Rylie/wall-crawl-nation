import PosterCard from "../../components/PosterCard";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

type Poster = {
  id: string;
  title: string;
  price: number;
  imagePath: string;
};

export default async function ShopPage() {
  const postersQuery = query(
    collection(db, "posters"),
    where("isActive", "==", true),
    orderBy("createdAt", "asc"),
  );

  const snapshot = await getDocs(postersQuery);

  const posters: Poster[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Poster, "id">),
  }));

  return (
    <div className="px-2 sm:px-4">
      {/* heading */}
      <h1 className="mb-4 text-xl font-semibold tracking-tight">
        Shop Posters
      </h1>

      {/* empty state */}
      {posters.length === 0 && (
        <p className="text-sm text-white/60">No posters available right now.</p>
      )}

      {/* posters grid */}
      <div
        className="
    grid
    grid-cols-2
    gap-4
    sm:grid-cols-3
    sm:gap-5
    md:grid-cols-4
    md:gap-6
    lg:grid-cols-6
    lg:gap-7
  "
      >
        {posters.map((poster) => (
          <PosterCard
            key={poster.id}
            id={poster.id}
            title={poster.title}
            price={poster.price}
            imagePath={poster.imagePath}
          />
        ))}
      </div>
    </div>
  );
}
