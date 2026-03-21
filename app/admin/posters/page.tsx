"use client";

import { useEffect, useRef, useState } from "react";
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
	tags: string;
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
	const [editTagsToAdd, setEditTagsToAdd] = useState("");

	// Bulk mode state
	const [bulkMode, setBulkMode] = useState(false);
	const [selectedPosters, setSelectedPosters] = useState<string[]>([]);
	const [selectedTag, setSelectedTag] = useState("");
	const [bulkLoading, setBulkLoading] = useState(false);
	const lastClickedIndex = useRef<number | null>(null);

	useEffect(() => {
		fetch("/api/admin/posters")
			.then((res) => res.json())
			.then((data) => {
				const sorted = (data.posters || []).slice().sort((a: any, b: any) => {
					const aSec = a?.createdAt?.seconds ?? (a?.createdAt ? Date.parse(a.createdAt) / 1000 : 0);
					const bSec = b?.createdAt?.seconds ?? (b?.createdAt ? Date.parse(b.createdAt) / 1000 : 0);
					return aSec - bSec;
				});
				setPosters(sorted);
				setLoading(false);
			});
	}, []);

	// Fetch all tags
	async function fetchTags() {
		const res = await fetch("/api/admin/tags/list");
		const data = await res.json();
		setAllTags(data.tags || []);
	}

	// Fetch tags when entering bulk mode
	useEffect(() => {
		if (bulkMode) {
			fetchTags();
		}
	}, [bulkMode]);

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

		await fetch("/api/admin/posters/updateTags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ posterId: tagModalPoster.id, tags: updatedTags }),
		});

		const updatedPoster = { ...tagModalPoster, tags: updatedTags };
		setTagModalPoster(updatedPoster);
		setPosters((prev) =>
			prev.map((p) => (p.id === tagModalPoster.id ? updatedPoster : p))
		);
	}

	async function handleCreateTag() {
		const rawTags = newTagName.split(",");
		const tagsToCreate = rawTags
			.map((t) => t.trim().toLowerCase())
			.filter(Boolean);

		if (tagsToCreate.length === 0) return;

		setCreatingTag(true);

		for (const tag of tagsToCreate) {
			await fetch("/api/admin/tags/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: tag }),
			});
		}

		// Also auto-assign the newly created tags to the currently selected poster
		if (tagModalPoster) {
			const currentTags = tagModalPoster.tags || [];
			const uniqueNewTags = tagsToCreate.filter(t => !currentTags.includes(t));
			
			if (uniqueNewTags.length > 0) {
				const updatedTags = [...currentTags, ...uniqueNewTags];
				
				await fetch("/api/admin/posters/updateTags", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ posterId: tagModalPoster.id, tags: updatedTags }),
				});

				const updatedPoster = { ...tagModalPoster, tags: updatedTags };
				setTagModalPoster(updatedPoster);
				setPosters((prev) =>
					prev.map((p) => (p.id === tagModalPoster.id ? updatedPoster : p))
				);
			}
		}

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

	async function handleAddTagsToEdit() {
		if (!editingPoster || !editTagsToAdd.trim()) return;

		const rawTags = editTagsToAdd.split(",");
		const tagsToAdd = rawTags.map((t) => t.trim().toLowerCase()).filter(Boolean);

		if (tagsToAdd.length === 0) return;

		const currentTags = editingPoster.tags || [];
		const uniqueNewTags = tagsToAdd.filter(t => !currentTags.includes(t));

		if (uniqueNewTags.length === 0) {
			setEditTagsToAdd("");
			return;
		}

		// Ensure tags are created in the database if they don't exist
		for (const tag of uniqueNewTags) {
			if (!allTags.includes(tag)) {
				await fetch("/api/admin/tags/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: tag }),
				});
			}
		}

		const updatedTags = [...currentTags, ...uniqueNewTags];

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
		setEditTagsToAdd("");
		fetchTags(); // Refresh global tags list
	}

	// Bulk selection with shift-click support
	function handlePosterSelect(posterId: string, index: number, shiftKey: boolean) {
		if (shiftKey && lastClickedIndex.current !== null) {
			const start = Math.min(lastClickedIndex.current, index);
			const end = Math.max(lastClickedIndex.current, index);
			const rangeIds = posters.slice(start, end + 1).map((p) => p.id);

			setSelectedPosters((prev) => {
				const merged = new Set([...prev, ...rangeIds]);
				return Array.from(merged);
			});
		} else {
			setSelectedPosters((prev) => {
				if (prev.includes(posterId)) {
					return prev.filter((id) => id !== posterId);
				} else {
					return [...prev, posterId];
				}
			});
		}

		lastClickedIndex.current = index;
	}

	// Bulk add tag
	async function bulkAddTag() {
		if (!selectedTag || selectedPosters.length === 0) return;

		setBulkLoading(true);
		await fetch("/api/admin/posters/bulkTag", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				posterIds: selectedPosters,
				tag: selectedTag,
				action: "add",
			}),
		});

		// Update local state
		setPosters((prev) =>
			prev.map((p) => {
				if (selectedPosters.includes(p.id)) {
					const currentTags = p.tags || [];
					if (!currentTags.includes(selectedTag)) {
						return { ...p, tags: [...currentTags, selectedTag] };
					}
				}
				return p;
			})
		);

		setBulkLoading(false);
	}

	// Bulk remove tag
	async function bulkRemoveTag() {
		if (!selectedTag || selectedPosters.length === 0) return;

		setBulkLoading(true);
		await fetch("/api/admin/posters/bulkTag", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				posterIds: selectedPosters,
				tag: selectedTag,
				action: "remove",
			}),
		});

		// Update local state
		setPosters((prev) =>
			prev.map((p) => {
				if (selectedPosters.includes(p.id)) {
					return { ...p, tags: (p.tags || []).filter((t) => t !== selectedTag) };
				}
				return p;
			})
		);

		setBulkLoading(false);
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
				price: "30",
				tags: "",
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
			if (item.tags.trim()) {
				fd.append("tags", item.tags);
			}

			console.log("Making fetch request to /api/admin/posters");

			const res = await fetch("/api/admin/posters", {
				method: "POST",
				body: fd,
			});

			console.log("Response status:", res.status);
		}

		setUploading(false);
		console.log("Set uploading to false, reloading page");
		location.reload();
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold">Manage Posters</h1>

				{/* Bulk mode toggle */}
				<button
					onClick={() => {
						setBulkMode(!bulkMode);
						setSelectedPosters([]);
						setSelectedTag("");
						lastClickedIndex.current = null;
					}}
					className={`px-4 py-2 text-sm rounded-lg transition ${
						bulkMode
							? "bg-white text-black font-medium"
							: "bg-neutral-800 text-white/70 hover:bg-neutral-700"
					}`}
					type="button"
				>
					{bulkMode ? "Exit Bulk Mode" : "Bulk Tag"}
				</button>
			</div>

			{/* Bulk mode hint */}
			{bulkMode && (
				<div className="mb-4 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
					Click posters to select them. Hold <strong>Shift</strong> and click to select a range.
				</div>
			)}

			{/* Upload section */}
			{!bulkMode && (
				<div className="mb-6">
					<label className="inline-flex items-center px-4 py-2 bg-green-600 text-black rounded-md cursor-pointer">
						Choose files
						<input type="file" multiple onChange={handleFilesChange} className="hidden" />
					</label>

					{uploads.length > 0 && (
						<div className="mt-4">
							{uploads.map((item, i) => (
								<div key={i} className="bg-[#1a1a1a] p-4 rounded-xl mb-4 border border-white/5">
									<div className="flex justify-between items-center mb-2">
										<p className="text-sm font-mono text-white/50">{item.file.name}</p>
										<button 
											onClick={() => setUploads(uploads.filter((_, idx) => idx !== i))}
											className="text-white/20 hover:text-red-500 text-xs transition"
										>
											Remove
										</button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
										<input
											type="text"
											placeholder="Title"
											value={item.title}
											onChange={(e) => {
												const copy = [...uploads];
												copy[i].title = e.target.value;
												setUploads(copy);
											}}
											className="w-full p-2 bg-black border border-white/10 rounded text-sm"
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
											className="w-full p-2 bg-black border border-white/10 rounded text-sm"
										/>
									</div>
									
									<input
										type="text"
										placeholder="Tags (comma-separated, e.g. anime, movies)"
										value={item.tags}
										onChange={(e) => {
											const copy = [...uploads];
											copy[i].tags = e.target.value;
											setUploads(copy);
										}}
										className="w-full p-2 bg-black border border-white/10 rounded text-sm"
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
			)}

			{/* Posters grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
				{posters.map((poster, index) => {
					const isSelected = selectedPosters.includes(poster.id);

					return (
						<div
							key={poster.id}
							className={`relative bg-[#1a1a1a] rounded-xl p-3 ring-1 transition ${
								bulkMode && isSelected
									? "ring-green-500 bg-green-950/20"
									: "ring-white/5"
							} ${bulkMode ? "cursor-pointer" : ""}`}
							onClick={
								bulkMode
									? (e) => handlePosterSelect(poster.id, index, e.shiftKey)
									: undefined
							}
						>
							{/* Bulk mode checkbox */}
							{bulkMode && (
								<div className="absolute top-2 left-2 z-10">
									<input
										type="checkbox"
										className="w-5 h-5 accent-green-500"
										checked={isSelected}
										onChange={() => {}}
										onClick={(e) => e.stopPropagation()}
									/>
								</div>
							)}

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

							{/* Normal mode buttons */}
							{!bulkMode && (
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
							)}
						</div>
					);
				})}
			</div>

			{/* Bulk actions floating toolbar */}
			{bulkMode && selectedPosters.length > 0 && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 border border-neutral-700 px-6 py-3 rounded-xl flex gap-4 items-center shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
					<span className="text-sm font-medium text-white/80">
						{selectedPosters.length} selected
					</span>

					<div className="w-px h-6 bg-white/10" />

					<select
						value={selectedTag}
						onChange={(e) => setSelectedTag(e.target.value)}
						className="bg-neutral-800 text-white text-sm px-3 py-1.5 rounded-lg border border-white/10"
					>
						<option value="">Select tag</option>
						{allTags.map((tag) => (
							<option key={tag} value={tag}>
								{tag}
							</option>
						))}
					</select>

					<button
						onClick={bulkAddTag}
						disabled={!selectedTag || bulkLoading}
						className="bg-green-600 text-black text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50 hover:bg-green-700 transition"
						type="button"
					>
						{bulkLoading ? "..." : "Add Tag"}
					</button>

					<button
						onClick={bulkRemoveTag}
						disabled={!selectedTag || bulkLoading}
						className="bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50 hover:bg-red-700 transition"
						type="button"
					>
						{bulkLoading ? "..." : "Remove Tag"}
					</button>

					<div className="w-px h-6 bg-white/10" />

					<button
						onClick={() => {
							setSelectedPosters([]);
							lastClickedIndex.current = null;
						}}
						className="text-white/50 hover:text-white text-sm transition"
						type="button"
					>
						Clear
					</button>
				</div>
			)}

			{/* Edit modal */}
			{editingPoster && (
				<div 
					className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
					onClick={() => setEditingPoster(null)}
				>
					<div 
						className="bg-[#111] p-8 rounded-2xl w-[400px] ring-1 ring-white/10 max-h-[90vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
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

						{/* Tags section */}
						<div className="mb-4">
							<p className="text-sm text-white/60 mb-2">Tags</p>
							
							{/* Current tags */}
							{editingPoster.tags && editingPoster.tags.length > 0 && (
								<div className="flex gap-2 flex-wrap mb-3">
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
							)}

							{/* Add new tags manually */}
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Add tags separated by commas... (e.g. anime, movies)"
									value={editTagsToAdd}
									onChange={(e) => setEditTagsToAdd(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleAddTagsToEdit();
									}}
									className="flex-1 p-2 bg-black border border-white/10 rounded text-sm"
								/>
								<button
									onClick={handleAddTagsToEdit}
									disabled={!editTagsToAdd.trim()}
									className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md disabled:opacity-50"
									type="button"
								>
									Add
								</button>
							</div>
						</div>

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
				<div 
					className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
					onClick={() => setTagModalPoster(null)}
				>
					<div 
						className="bg-[#111] p-8 rounded-2xl w-[400px] ring-1 ring-white/10 max-h-[80vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">Add Tags</h2>
							<button
								onClick={() => setTagModalPoster(null)}
								className="text-white/40 hover:text-white transition text-xl"
								type="button"
							>
								×
							</button>
						</div>

						<p className="text-sm text-white/50 mb-6 truncate">
							{tagModalPoster.title}
						</p>

						{/* Create new tag (Moved to top) */}
						<div className="mb-6 pb-6 border-b border-white/10 shrink-0">
							<div className="flex gap-2">
								<input
									type="text"
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreateTag();
									}}
									placeholder="Add tags (comma-separated)..."
									className="flex-1 p-2 bg-black border border-white/10 rounded text-sm"
								/>
								<button
									onClick={handleCreateTag}
									disabled={creatingTag || !newTagName.trim()}
									className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md disabled:opacity-50"
									type="button"
								>
									{creatingTag ? "..." : "Add"}
								</button>
							</div>
						</div>

						{/* Tag list */}
						<div className="space-y-2 overflow-y-auto pr-2 pb-2">
							{allTags.map((tag) => {
								const isSelected = (tagModalPoster.tags || []).includes(tag);
								return (
									<button
										key={tag}
										onClick={() => handleToggleTag(tag)}
										className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
											isSelected
												? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30"
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
									No tags yet. Create one above.
								</p>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
