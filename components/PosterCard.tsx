export default function PosterCard({
  title,
  price,
}: {
  title: string;
  price: number;
}) {
  return (
    <div className="border border-white p-4 rounded-lg hover:scale-[1.02] transition">
      <div className="h-40 bg-gray-800 mb-4 rounded" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm opacity-80">₹{price}</p>
    </div>
  );
}
