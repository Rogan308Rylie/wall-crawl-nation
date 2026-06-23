import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-12 border-b-8 border-black pb-6">
        <h1 className="text-5xl font-black mb-4 uppercase text-black tracking-tighter">
          Admin Dashboard
        </h1>
        <p className="text-lg font-bold text-black bg-[#A3FF12] inline-block px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000] uppercase">
          Overview of your Wall Crawl Nation operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Total Orders Card */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_#A3FF12]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1 inline-block">
                Total Orders
              </h3>
              <p className="text-5xl font-black text-black">-</p>
            </div>
            <div className="text-4xl opacity-50 drop-shadow-[2px_2px_0_#A3FF12]">📦</div>
          </div>
          <p className="text-sm font-bold text-black/50 mt-6 uppercase">Yet to integrate</p>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_#A3FF12]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1 inline-block">
                Total Revenue
              </h3>
              <p className="text-5xl font-black text-black">-</p>
            </div>
            <div className="text-4xl opacity-50 drop-shadow-[2px_2px_0_#A3FF12]">💰</div>
          </div>
          <p className="text-sm font-bold text-black/50 mt-6 uppercase">Yet to integrate</p>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_#A3FF12]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-3 border-b-2 border-black pb-1 inline-block">
                Pending Orders
              </h3>
              <p className="text-5xl font-black text-black">-</p>
            </div>
            <div className="text-4xl opacity-50 drop-shadow-[2px_2px_0_#A3FF12]">⏳</div>
          </div>
          <p className="text-sm font-bold text-black/50 mt-6 uppercase">Yet to integrate</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[#f0f0f0] border-4 border-black p-8 shadow-[12px_12px_0_0_#A3FF12]">
        <h2 className="text-3xl font-black mb-8 uppercase text-black border-b-4 border-black pb-2 inline-block">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/orders"
            className="
              block
              p-6
              bg-white
              border-4
              border-black
              hover:-translate-y-2
              hover:shadow-[8px_8px_0_0_#A3FF12]
              transition-all
              text-center
            "
          >
            <p className="text-xl font-black uppercase text-black">View Orders</p>
            <p className="text-sm font-bold text-black/60 mt-2 uppercase">Manage customer orders</p>
          </Link>

          <Link
            href="/admin/posters"
            className="
              block
              p-6
              bg-white
              border-4
              border-black
              hover:-translate-y-2
              hover:shadow-[8px_8px_0_0_#A3FF12]
              transition-all
              text-center
            "
          >
            <p className="text-xl font-black uppercase text-black">Manage Posters</p>
            <p className="text-sm font-bold text-black/60 mt-2 uppercase">Add, edit, or remove</p>
          </Link>

          <div
            className="
              block
              p-6
              bg-[#e0e0e0]
              border-4
              border-black/30
              opacity-60
              cursor-not-allowed
              text-center
            "
          >
            <p className="text-xl font-black uppercase text-black">Analytics</p>
            <p className="text-sm font-bold text-black/60 mt-2 uppercase">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
