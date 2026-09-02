"use client"

import { useEffect, useState } from "react"
import { Coupon } from "@/types/coupon"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [newCode, setNewCode] = useState("")
  const [newType, setNewType] = useState<"percentage" | "fixed">("fixed")
  const [newValue, setNewValue] = useState("")
  const [newMaxUses, setNewMaxUses] = useState("")

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons/list")
      if (!res.ok) throw new Error("Failed to fetch coupons")
      const data = await res.json()
      setCoupons(data.coupons)
    } catch (err) {
      setError("Failed to load coupons.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode || !newValue) return

    try {
      const res = await fetch("/api/admin/coupons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          type: newType,
          value: newValue,
          maxUses: newMaxUses ? newMaxUses : null,
          isActive: true
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create coupon")

      setNewCode("")
      setNewValue("")
      setNewMaxUses("")
      fetchCoupons()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      })

      if (!res.ok) throw new Error("Failed to update coupon")
      fetchCoupons()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="font-black uppercase text-2xl">Loading...</div>

  return (
    <div>
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-8 border-black pb-4 inline-block">
        Coupons
      </h1>

      {error && <div className="text-red-500 font-bold mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="grid gap-6">
            {coupons.map((coupon) => (
              <div key={coupon.id} className={`border-4 border-black p-6 bg-white shadow-[8px_8px_0_0_#000] flex justify-between items-center ${!coupon.isActive && "opacity-50"}`}>
                <div>
                  <h3 className="text-2xl font-black uppercase">{coupon.code}</h3>
                  <div className="text-lg font-bold mt-2">
                    Discount: {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                  </div>
                  <div className="text-sm font-bold text-gray-600 uppercase mt-1">
                    Uses: {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : "(Unlimited)"}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => toggleActive(coupon.id!, coupon.isActive)}
                    className={`px-4 py-2 font-black uppercase border-2 border-black ${coupon.isActive ? "bg-red-500 text-white" : "bg-[#A3FF12] text-black"}`}
                  >
                    {coupon.isActive ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <div className="border-4 border-black border-dashed p-12 text-center font-black uppercase text-gray-500">
                No coupons found
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0_0_#A3FF12] sticky top-8">
            <h2 className="text-2xl font-black uppercase mb-6">Create Coupon</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase mb-2">Code</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. RIZUL10"
                  className="w-full p-3 border-4 border-black bg-[#f0f0f0] font-bold uppercase focus:outline-none focus:bg-[#A3FF12]"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "percentage" | "fixed")}
                  className="w-full p-3 border-4 border-black bg-[#f0f0f0] font-bold uppercase focus:outline-none focus:bg-[#A3FF12]"
                >
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Value</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full p-3 border-4 border-black bg-[#f0f0f0] font-bold focus:outline-none focus:bg-[#A3FF12]"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Max Uses (Optional)</label>
                <input
                  type="number"
                  min="1"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  placeholder="Leave empty for unlimited"
                  className="w-full p-3 border-4 border-black bg-[#f0f0f0] font-bold focus:outline-none focus:bg-[#A3FF12]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-[#A3FF12] px-6 py-4 font-black uppercase border-4 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#A3FF12] transition-all"
              >
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
