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
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(postersQuery);

  const posters: Poster[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Poster, "id">),
  }));

  return (
    <div className="px-2 sm:px-4">
      {/* tighter, modern heading */}
      <h1 className="text-xl font-semibold mb-4 tracking-tight">
        Shop Posters
      </h1>

      {posters.length === 0 && (
        <p className="text-white/60 text-sm">
          No posters available right now.
        </p>
      )}

      {/* dense, youth-friendly grid */}
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-6
          gap-3
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
