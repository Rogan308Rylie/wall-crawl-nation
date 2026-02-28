import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-white/60">
          Overview of your Wall Crawl Nation operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Orders Card */}
        <div className="bg-[#1a1a1a] p-6 rounded-xl ring-1 ring-white/5 hover:ring-white/10 transition">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                Total Orders
              </h3>
              <p className="text-4xl font-bold">—</p>
            </div>
            <div className="text-2xl opacity-20">📦</div>
          </div>
          <p className="text-xs text-white/40 mt-4">Yet to integrate</p>
        </div>

        {/* Revenue Card */}
        <div className="bg-[#1a1a1a] p-6 rounded-xl ring-1 ring-white/5 hover:ring-white/10 transition">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                Total Revenue
              </h3>
              <p className="text-4xl font-bold">—</p>
            </div>
            <div className="text-2xl opacity-20">💰</div>
          </div>
          <p className="text-xs text-white/40 mt-4">Yet to integrate</p>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-[#1a1a1a] p-6 rounded-xl ring-1 ring-white/5 hover:ring-white/10 transition">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
                Pending Orders
              </h3>
              <p className="text-4xl font-bold">—</p>
            </div>
            <div className="text-2xl opacity-20">⏳</div>
          </div>
          <p className="text-xs text-white/40 mt-4">Yet to integrate</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl ring-1 ring-white/5">
        <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/orders"
            className="
              block
              p-4
              rounded-lg
              bg-[#111]
              border
              border-white/10
              hover:border-white/20
              hover:bg-white/5
              transition
              text-center
            "
          >
            <p className="text-sm font-medium">View Orders</p>
            <p className="text-xs text-white/40 mt-1">Manage customer orders</p>
          </Link>

          <Link
            href="/admin/posters"
            className="
              block
              p-4
              rounded-lg
              bg-[#111]
              border
              border-white/10
              hover:border-white/20
              hover:bg-white/5
              transition
              text-center
            "
          >
            <p className="text-sm font-medium">Manage Posters</p>
            <p className="text-xs text-white/40 mt-1">Add, edit, or remove posters</p>
          </Link>

          <div
            className="
              block
              p-4
              rounded-lg
              bg-[#111]
              border
              border-white/10
              opacity-50
              cursor-not-allowed
              text-center
            "
          >
            <p className="text-sm font-medium">Analytics</p>
            <p className="text-xs text-white/40 mt-1">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
