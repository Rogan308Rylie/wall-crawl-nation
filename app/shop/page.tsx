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
    <div>
      <h1 className="text-2xl font-bold mb-6">Shop Posters</h1>

      {posters.length === 0 && (
        <p className="text-white/70">No posters available right now.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
