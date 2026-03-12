"use client";

import { useEffect, useState } from "react";

export default function AdminTagsPage() {
	const [tags, setTags] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [newTagName, setNewTagName] = useState("");
	const [creating, setCreating] = useState(false);

	async function fetchTags() {
		const res = await fetch("/api/admin/tags/list");
		const data = await res.json();
		setTags(data.tags || []);
		setLoading(false);
	}

	useEffect(() => {
		fetchTags();
	}, []);

	async function handleCreateTag() {
		const trimmed = newTagName.trim().toLowerCase();
		if (!trimmed) return;

		setCreating(true);

		const res = await fetch("/api/admin/tags/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: trimmed }),
		});

		const data = await res.json();

		if (data.error) {
			alert(data.error);
		}

		setNewTagName("");
		setCreating(false);
		await fetchTags();
	}

	if (loading) {
		return <p className="text-white/60">Loading tags...</p>;
	}

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-6">Manage Tags</h1>

			{/* Create new tag */}
			<div className="bg-[#1a1a1a] p-6 rounded-xl ring-1 ring-white/5 mb-8">
				<h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
					Create New Tag
				</h2>
				<div className="flex gap-3">
					<input
						type="text"
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleCreateTag();
						}}
						placeholder="Enter tag name..."
						className="flex-1 p-3 bg-black border border-white/10 rounded-lg text-sm focus:outline-none focus:border-white/30 transition"
					/>
					<button
						onClick={handleCreateTag}
						disabled={creating || !newTagName.trim()}
						className="px-6 py-3 bg-green-600 text-black font-medium text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
						type="button"
					>
						{creating ? "Creating..." : "Create Tag"}
					</button>
				</div>
			</div>

			{/* Existing tags list */}
			<div className="bg-[#1a1a1a] p-6 rounded-xl ring-1 ring-white/5">
				<h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
					All Tags ({tags.length})
				</h2>

				{tags.length === 0 ? (
					<p className="text-white/30 text-sm py-4">
						No tags created yet. Use the form above to create your first tag.
					</p>
				) : (
					<div className="flex gap-2 flex-wrap">
						{tags.map((tag) => (
							<div
								key={tag}
								className="px-4 py-2 text-sm rounded-lg bg-neutral-800 text-white/80 ring-1 ring-white/5"
							>
								{tag}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
