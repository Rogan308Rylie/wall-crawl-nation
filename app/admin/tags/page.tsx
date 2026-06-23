"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
		return <p className="text-2xl font-black uppercase text-black">Loading tags...</p>;
	}

	return (
		<div>
			<h1 className="text-5xl font-black mb-10 pb-4 border-b-8 border-black text-black uppercase tracking-tighter inline-block pr-8">Manage Tags</h1>

			{/* Create new tag */}
			<div className="bg-white p-8 border-4 border-black shadow-[12px_12px_0_0_#A3FF12] mb-12">
				<h2 className="text-xl font-black text-black uppercase tracking-widest mb-6 border-b-4 border-black inline-block pb-2">
					Create New Tag
				</h2>
				<div className="flex flex-col md:flex-row gap-4">
					<input
						type="text"
						value={newTagName}
						onChange={(e) => setNewTagName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleCreateTag();
						}}
						placeholder="Enter tag name..."
						className="flex-1 p-4 bg-[#f0f0f0] border-4 border-black text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
					/>
					<button
						onClick={handleCreateTag}
						disabled={creating || !newTagName.trim()}
						className="px-8 py-4 bg-black text-[#A3FF12] font-black uppercase text-xl border-4 border-black hover:bg-white hover:text-black hover:-translate-y-1 shadow-[6px_6px_0_0_#000] disabled:opacity-50 transition-all cursor-pointer"
						type="button"
					>
						{creating ? "Creating..." : "Create Tag"}
					</button>
				</div>
			</div>

			{/* Existing tags list */}
			<div className="bg-white p-8 border-4 border-black shadow-[12px_12px_0_0_#A3FF12]">
				<h2 className="text-xl font-black text-black uppercase tracking-widest mb-6 border-b-4 border-black inline-block pb-2">
					All Tags ({tags.length})
				</h2>

				{tags.length === 0 ? (
					<p className="text-black/50 text-xl font-bold uppercase py-4">
						No tags created yet. Use the form above to create your first tag.
					</p>
				) : (
					<div className="flex gap-4 flex-wrap">
						{tags.map((tag) => (
							<div
								key={tag}
								className="flex items-center gap-3 px-4 py-2 text-lg font-black uppercase tracking-widest bg-black text-[#A3FF12] border-4 border-black shadow-[4px_4px_0_0_#A3FF12]"
							>
								{tag}
								<button
									onClick={async () => {
										if (!confirm(`Delete tag "${tag}"?`)) return;
										await fetch("/api/admin/tags/delete", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ name: tag }),
										});
										await fetchTags();
									}}
									className="text-white hover:text-red-500 transition-colors leading-none ml-2 flex items-center"
									type="button"
								>
									<X className="w-5 h-5" strokeWidth={3} />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
