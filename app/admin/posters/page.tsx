"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Poster = {
	id: string;
	title: string;
	price: number;
	imagePath: string;
	isActive: boolean;
	tags?: string[];
	createdAt?: any;
};

type UploadItem = {
	file: File;
	title: string;
	price: string;
};

export default function AdminPostersPage() {
	const [posters, setPosters] = useState<Poster[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
	const [uploads, setUploads] = useState<UploadItem[]>([]);
	const [uploading, setUploading] = useState(false);

	// Tag state
	const [tagModalPoster, setTagModalPoster] = useState<Poster | null>(null);
	const [allTags, setAllTags] = useState<string[]>([]);
	const [newTagName, setNewTagName] = useState("");
	const [creatingTag, setCreatingTag] = useState(false);

	useEffect(() => {
		fetch("/api/admin/posters")
			.then((res) => res.json())
			.then((data) => {
				// sort by createdAt ascending (oldest -> newest)
				const sorted = (data.posters || []).slice().sort((a: any, b: any) => {
					const aSec = a?.createdAt?.seconds ?? (a?.createdAt ? Date.parse(a.createdAt) / 1000 : 0);
					const bSec = b?.createdAt?.seconds ?? (b?.createdAt ? Date.parse(b.createdAt) / 1000 : 0);
					return aSec - bSec;
				});
				setPosters(sorted);
				setLoading(false);
			});
	}, []);

	// Fetch all tags when tag modal is opened
	async function fetchTags() {
		const res = await fetch("/api/admin/tags/list");
		const data = await res.json();
		setAllTags(data.tags || []);
	}

	function openTagModal(poster: Poster) {
		setTagModalPoster(poster);
		fetchTags();
	}

	async function handleToggleTag(tag: string) {
		if (!tagModalPoster) return;

		const currentTags = tagModalPoster.tags || [];
		let updatedTags: string[];

		if (currentTags.includes(tag)) {
			updatedTags = currentTags.filter((t) => t !== tag);
		} else {
			updatedTags = [...currentTags, tag];
		}

		// Update in Firestore
		await fetch("/api/admin/posters/updateTags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ posterId: tagModalPoster.id, tags: updatedTags }),
		});

		// Update local state
		const updatedPoster = { ...tagModalPoster, tags: updatedTags };
		setTagModalPoster(updatedPoster);
		setPosters((prev) =>
			prev.map((p) => (p.id === tagModalPoster.id ? updatedPoster : p))
		);
	}

	async function handleCreateTag() {
		const trimmed = newTagName.trim().toLowerCase();
		if (!trimmed) return;

		setCreatingTag(true);
		await fetch("/api/admin/tags/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: trimmed }),
		});

		setNewTagName("");
		setCreatingTag(false);
		await fetchTags();
	}

	async function handleRemoveTag(tag: string) {
		if (!editingPoster) return;

		const updatedTags = (editingPoster.tags || []).filter((t) => t !== tag);

		await fetch("/api/admin/posters/updateTags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ posterId: editingPoster.id, tags: updatedTags }),
		});

		const updatedPoster = { ...editingPoster, tags: updatedTags };
		setEditingPoster(updatedPoster);
		setPosters((prev) =>
			prev.map((p) => (p.id === editingPoster.id ? updatedPoster : p))
		);
	}

	if (loading) {
		return <p className="text-white/60">Loading posters...</p>;
	}

	async function handleSaveEdit() {
		if (!editingPoster) return;
		await fetch(`/api/admin/posters/${editingPoster.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(editingPoster),
		});
		setEditingPoster(null);
		location.reload();
	}

	function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files || []);
		setUploads(
			files.map((file) => ({
				file,
				title: "",
				price: "",
			}))
		);
	}

	async function handleSubmitUploads() {
		console.log("===== UPLOAD CLICKED =====");
		console.log("Uploads length:", uploads.length);
		console.log("Uploads array:", uploads);

		if (uploads.length === 0) {
			console.log("No uploads found, returning early");
			return;
		}

		setUploading(true);
		console.log("Set uploading to true");

		for (const item of uploads) {
			console.log("Uploading item:", item.title);

			const fd = new FormData();
			fd.append("image", item.file);
			fd.append("title", item.title);
			fd.append("price", item.price);

			console.log("Making fetch request to /api/admin/posters");

			const res = await fetch("/api/admin/posters", {
				method: "POST",
				body: fd,
			});

			console.log("Response status:", res.status);
			console.log("Response:", res);
		}

		setUploading(false);
		console.log("Set uploading to false, reloading page");
		location.reload();
	}

	return (
		<div>
			<h1 className="text-2xl font-semibold mb-6">Manage Posters</h1>

			{/* Upload section: styled choose files button */}
			<div className="mb-6">
				<label className="inline-flex items-center px-4 py-2 bg-green-600 text-black rounded-md cursor-pointer">
					Choose files
					<input type="file" multiple onChange={handleFilesChange} className="hidden" />
				</label>

				{uploads.length > 0 && (
					<div className="mt-4">
						{uploads.map((item, i) => (
							<div key={i} className="bg-[#1a1a1a] p-4 rounded-xl mb-4">
								<p className="text-sm mb-2">{item.file.name}</p>

								<input
									type="text"
									placeholder="Title"
									value={item.title}
									onChange={(e) => {
										const copy = [...uploads];
										copy[i].title = e.target.value;
										setUploads(copy);
									}}
									className="w-full mb-2 p-2 bg-black border border-white/10 rounded"
								/>

								<input
									type="number"
									placeholder="Price"
									value={item.price}
									onChange={(e) => {
										const copy = [...uploads];
										copy[i].price = e.target.value;
										setUploads(copy);
									}}
									className="w-full p-2 bg-black border border-white/10 rounded"
								/>
							</div>
						))}

						<button
							type="button"
							onClick={handleSubmitUploads}
							disabled={uploading}
							className="px-4 py-2 bg-green-600 text-black rounded-md"
						>
							{uploading ? "Uploading..." : "Upload all"}
						</button>
					</div>
				)}
			</div>

			{/* Posters grid: 5 per row, smaller cards */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
				{posters.map((poster) => (
					<div
						key={poster.id}
						className="bg-[#1a1a1a] rounded-xl p-3 ring-1 ring-white/5"
					>
						<div className="relative w-full aspect-[140/198] mb-3">
							<Image
								src={poster.imagePath}
								alt={poster.title}
								fill
								className="object-contain rounded-md"
							/>
						</div>

						<h3 className="font-semibold text-sm truncate">{poster.title}</h3>
						<p className="text-white/60 text-xs">₹{poster.price}</p>

						{/* Tag tablets */}
						{poster.tags && poster.tags.length > 0 && (
							<div className="flex gap-1.5 flex-wrap mt-2">
								{poster.tags.map((tag) => (
									<div
										key={tag}
										className="px-2 py-0.5 text-[10px] rounded bg-neutral-700 text-white/80"
									>
										{tag}
									</div>
								))}
							</div>
						)}

						<div className="flex gap-2 mt-3">
							<button
								onClick={() => setEditingPoster(poster)}
								className="flex-1 px-2 py-1 text-sm rounded-md bg-green-600 text-black hover:bg-green-700"
								type="button"
							>
								Edit
							</button>

							<button
								onClick={() => openTagModal(poster)}
								className="px-2 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
								type="button"
							>
								+ Tag
							</button>

							<button
								className="flex-1 px-2 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
								type="button"
							>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Edit modal */}
			{editingPoster && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
					<div className="bg-[#111] p-8 rounded-2xl w-[400px] ring-1 ring-white/10">
						<h2 className="text-lg font-semibold mb-4">Edit Poster</h2>

						<input
							type="text"
							value={editingPoster.title}
							onChange={(e) =>
								setEditingPoster({
									...editingPoster,
									title: e.target.value,
								})
							}
							className="w-full mb-4 p-2 bg-black border border-white/10 rounded"
						/>

						<input
							type="number"
							value={editingPoster.price}
							onChange={(e) =>
								setEditingPoster({
									...editingPoster,
									price: Number(e.target.value),
								})
							}
							className="w-full mb-4 p-2 bg-black border border-white/10 rounded"
						/>

						{/* Tags with remove option */}
						{editingPoster.tags && editingPoster.tags.length > 0 && (
							<div className="mb-4">
								<p className="text-sm text-white/60 mb-2">Tags</p>
								<div className="flex gap-2 flex-wrap">
									{editingPoster.tags.map((tag) => (
										<div
											key={tag}
											className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-neutral-700 text-white/80"
										>
											{tag}
											<button
												onClick={() => handleRemoveTag(tag)}
												className="ml-1 text-white/50 hover:text-white transition"
												type="button"
											>
												×
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="flex justify-between">
							<button
								onClick={() => setEditingPoster(null)}
								className="text-white/60"
								type="button"
							>
								Cancel
							</button>

							<button
								onClick={handleSaveEdit}
								className="text-black bg-green-600 px-3 py-1 rounded-md"
								type="button"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Tag selector modal */}
			{tagModalPoster && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
					<div className="bg-[#111] p-8 rounded-2xl w-[400px] ring-1 ring-white/10 max-h-[80vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-lg font-semibold">Add Tags</h2>
							<button
								onClick={() => setTagModalPoster(null)}
								className="text-white/40 hover:text-white transition text-xl"
								type="button"
							>
								×
							</button>
						</div>

						<p className="text-sm text-white/50 mb-4 truncate">
							{tagModalPoster.title}
						</p>

						{/* Tag list */}
						<div className="space-y-2 mb-6">
							{allTags.map((tag) => {
								const isSelected = (tagModalPoster.tags || []).includes(tag);
								return (
									<button
										key={tag}
										onClick={() => handleToggleTag(tag)}
										className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
											isSelected
												? "bg-green-600/20 text-green-400 ring-1 ring-green-500/30"
												: "bg-neutral-800 text-white/70 hover:bg-neutral-700"
										}`}
										type="button"
									>
										{isSelected && <span className="mr-2">✓</span>}
										{tag}
									</button>
								);
							})}

							{allTags.length === 0 && (
								<p className="text-white/30 text-sm text-center py-4">
									No tags yet. Create one below.
								</p>
							)}
						</div>

						{/* Create new tag */}
						<div className="border-t border-white/10 pt-4">
							<p className="text-sm text-white/50 mb-2">+ Create new tag</p>
							<div className="flex gap-2">
								<input
									type="text"
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreateTag();
									}}
									placeholder="Tag name"
									className="flex-1 p-2 bg-black border border-white/10 rounded text-sm"
								/>
								<button
									onClick={handleCreateTag}
									disabled={creatingTag || !newTagName.trim()}
									className="px-3 py-2 bg-green-600 text-black text-sm rounded-md disabled:opacity-50"
									type="button"
								>
									{creatingTag ? "..." : "Add"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
