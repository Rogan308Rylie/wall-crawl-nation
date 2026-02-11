"use client";

import { useState } from "react";
import { buttons } from "@/lib/ui/buttons";

export default function AdminPostersPage() {
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!title || !price || !image) {
    alert("Please fill all fields");
    return;
  }

  if (!["image/jpeg", "image/png"].includes(image.type)) {
    alert("Only JPG or PNG images allowed");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("price", price);
  formData.append("image", image);

  const res = await fetch("/api/admin/posters", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json();
    alert(data.error || "Failed to add poster");
    return;
  }

  alert("Poster added successfully!");

  // reset form
  setTitle("");
  setPrice("");
  setImage(null);
  setShowForm(false);
}


  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posters</h1>

        <button
          onClick={() => setShowForm(true)}
          className={buttons.secondary}
        >
          Add Poster
        </button>
      </div>

      {!showForm && (
        <p className="text-white/70">Poster management coming soon.</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md border border-white p-6 rounded-lg space-y-4"
        >
          <div>
            <label className="block mb-1 text-sm">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Price (₹)</label>
            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white rounded"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Poster Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={buttons.primary}
            >
              Save Poster
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={buttons.ghost}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
