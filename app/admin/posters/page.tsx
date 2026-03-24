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
			<div className="flex items-center justify-between mb-10 pb-4 border-b-8 border-black">
				<h1 className="text-5xl font-black uppercase text-black tracking-tighter">Manage Posters</h1>

				{/* Bulk mode toggle */}
				<button
					onClick={() => {
						setBulkMode(!bulkMode);
						setSelectedPosters([]);
						setSelectedTag("");
						lastClickedIndex.current = null;
					}}
					className={`px-6 py-3 text-lg font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0_0_#000] transition-all hover:scale-105 ${
						bulkMode
							? "bg-black text-[#A3FF12]"
							: "bg-white text-black hover:bg-[#A3FF12]"
					}`}
					type="button"
				>
					{bulkMode ? "Exit Bulk Mode" : "Bulk Tag"}
				</button>
			</div>

			{/* Bulk mode hint */}
			{bulkMode && (
				<div className="mb-8 p-6 bg-[#A3FF12] border-4 border-black shadow-[8px_8px_0_0_#000] text-lg font-bold text-black uppercase">
					Click posters to select them. Hold <strong className="underline decoration-4">Shift</strong> and click to select a range.
				</div>
			)}

			{/* Upload section */}
			{!bulkMode && (
				<div className="mb-12">
					<label className="inline-block px-8 py-4 bg-[#A3FF12] border-4 border-black shadow-[6px_6px_0_0_#000] font-black uppercase text-2xl hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all cursor-pointer">
						Choose files
						<input type="file" multiple onChange={handleFilesChange} className="hidden" />
					</label>

					{uploads.length > 0 && (
						<div className="mt-8 space-y-6">
							{uploads.map((item, i) => (
								<div key={i} className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_0_#A3FF12]">
									<div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
										<p className="text-xl font-bold font-mono text-black">{item.file.name}</p>
										<button 
											onClick={() => setUploads(uploads.filter((_, idx) => idx !== i))}
											className="text-black hover:text-red-600 font-black uppercase shrink-0 transition-colors"
										>
											✕ Remove
										</button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<input
											type="text"
											placeholder="Title"
											value={item.title}
											onChange={(e) => {
												const copy = [...uploads];
												copy[i].title = e.target.value;
												setUploads(copy);
											}}
											className="w-full p-4 border-4 border-black bg-[#f0f0f0] font-bold uppercase text-black placeholder-black/50 focus:bg-[#A3FF12] focus:outline-none transition-colors"
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
											className="w-full p-4 border-4 border-black bg-[#f0f0f0] font-bold uppercase text-black placeholder-black/50 focus:bg-[#A3FF12] focus:outline-none transition-colors"
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
										className="w-full p-4 border-4 border-black bg-[#f0f0f0] font-bold uppercase text-black placeholder-black/50 focus:bg-[#A3FF12] focus:outline-none transition-colors"
									/>
								</div>
							))}

							<button
								type="button"
								onClick={handleSubmitUploads}
								disabled={uploading}
								className="w-full py-6 bg-black text-[#A3FF12] font-black text-3xl uppercase border-4 border-black hover:bg-white hover:text-black transition-colors"
							>
								{uploading ? "Uploading..." : "Upload All"}
							</button>
						</div>
					)}
				</div>
			)}

			{/* Posters grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
				{posters.map((poster, index) => {
					const isSelected = selectedPosters.includes(poster.id);

					return (
						<div
							key={poster.id}
							className={`relative bg-white border-4 border-black p-4 transition-all ${
								bulkMode && isSelected
									? "shadow-[8px_8px_0_0_#A3FF12] bg-[#f0f0f0]"
									: "shadow-[4px_4px_0_0_#000]"
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
										className="w-6 h-6 border-4 border-black accent-[#A3FF12]"
										checked={isSelected}
										onChange={() => {}}
										onClick={(e) => e.stopPropagation()}
									/>
								</div>
							)}

							<div className="relative w-full aspect-[140/198] mb-4 border-2 border-black">
								<Image
									src={poster.imagePath}
									alt={poster.title}
									fill
									className="object-contain"
								/>
							</div>

							<h3 className="font-black text-lg uppercase truncate text-black mb-1">{poster.title}</h3>
							<p className="text-black font-bold text-lg bg-[#A3FF12] inline-block px-2 border-2 border-black shadow-[2px_2px_0_0_#000]">₹{poster.price}</p>

							{/* Tag tablets */}
							{poster.tags && poster.tags.length > 0 && (
								<div className="flex gap-2 flex-wrap mt-4">
									{poster.tags.map((tag) => (
										<div
											key={tag}
											className="px-2 py-1 text-xs font-black uppercase tracking-widest border-2 border-black bg-black text-[#A3FF12]"
										>
											{tag}
										</div>
									))}
								</div>
							)}

							{/* Normal mode buttons */}
							{!bulkMode && (
								<div className="flex flex-col gap-2 mt-6">
									<div className="flex gap-2">
										<button
											onClick={() => setEditingPoster(poster)}
											className="flex-1 px-3 py-2 text-sm font-black uppercase text-black bg-[#A3FF12] border-2 border-black hover:-translate-y-1 shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all"
											type="button"
										>
											Edit
										</button>

										<button
											onClick={() => openTagModal(poster)}
											className="flex-1 px-3 py-2 text-sm font-black uppercase text-black bg-white border-2 border-black hover:-translate-y-1 shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all"
											type="button"
										>
											+ Tag
										</button>
									</div>
									<button
										className="w-full px-3 py-2 text-sm font-black uppercase text-white bg-black border-2 border-black hover:-translate-y-1 shadow-[2px_2px_0_0_#A3FF12] hover:shadow-[4px_4px_0_0_#A3FF12] transition-all"
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
				<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white border-4 border-black px-6 py-4 flex gap-6 items-center shadow-[12px_12px_0_0_#000]">
					<span className="text-xl font-black uppercase text-black">
						<span className="bg-[#A3FF12] px-2 py-1 mr-2 border-2 border-black">{selectedPosters.length}</span> SELECTED
					</span>

					<div className="w-1 h-10 bg-black" />

					<select
						value={selectedTag}
						onChange={(e) => setSelectedTag(e.target.value)}
						className="bg-[#f0f0f0] text-black font-bold uppercase text-lg px-4 py-2 border-4 border-black focus:outline-none focus:bg-[#A3FF12] cursor-pointer"
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
						className="bg-black text-[#A3FF12] text-lg font-black uppercase px-6 py-2 border-4 border-black disabled:opacity-50 hover:bg-white hover:text-black hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer"
						type="button"
					>
						{bulkLoading ? "..." : "+ Add"}
					</button>

					<button
						onClick={bulkRemoveTag}
						disabled={!selectedTag || bulkLoading}
						className="bg-white text-black text-lg font-black uppercase px-6 py-2 border-4 border-black disabled:opacity-50 hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer"
						type="button"
					>
						{bulkLoading ? "..." : "- Remove"}
					</button>

					<div className="w-1 h-10 bg-black" />

					<button
						onClick={() => {
							setSelectedPosters([]);
							lastClickedIndex.current = null;
						}}
						className="text-black font-black uppercase hover:text-red-600 transition-colors text-lg"
						type="button"
					>
						Clear
					</button>
				</div>
			)}

			{/* Edit modal */}
			{editingPoster && (
				<div 
					className="fixed inset-0 bg-[#A3FF12]/90 flex items-center justify-center z-50 p-4"
					onClick={() => setEditingPoster(null)}
				>
					<div 
						className="bg-white p-8 w-full max-w-md border-8 border-black shadow-[16px_16px_0_0_#000] max-h-[90vh] overflow-y-auto relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setEditingPoster(null)}
							className="absolute top-6 right-6 text-black hover:text-[#A3FF12] text-4xl font-black transition-colors leading-none"
							type="button"
						>
							✕
						</button>

						<h2 className="text-3xl font-black uppercase text-black mb-8 border-b-8 border-black pb-4 inline-block">Edit Poster</h2>

						<input
							type="text"
							value={editingPoster.title}
							onChange={(e) =>
								setEditingPoster({
									...editingPoster,
									title: e.target.value,
								})
							}
							className="w-full mb-6 p-4 bg-[#f0f0f0] border-4 border-black text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
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
							className="w-full mb-6 p-4 bg-[#f0f0f0] border-4 border-black text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
						/>

						{/* Tags section */}
						<div className="mb-8">
							<p className="text-lg font-black uppercase tracking-widest text-black mb-3">Tags</p>
							
							{/* Current tags */}
							{editingPoster.tags && editingPoster.tags.length > 0 && (
								<div className="flex gap-3 flex-wrap mb-4">
									{editingPoster.tags.map((tag) => (
										<div
											key={tag}
											className="flex items-center gap-2 px-3 py-1 text-sm font-black uppercase tracking-widest bg-black text-[#A3FF12] border-4 border-black"
										>
											{tag}
											<button
												onClick={() => handleRemoveTag(tag)}
												className="ml-2 text-white hover:text-red-500 transition-colors text-xl leading-none"
												type="button"
											>
												✕
											</button>
										</div>
									))}
								</div>
							)}

							{/* Add new tags manually */}
							<div className="flex flex-col sm:flex-row gap-4 mt-2">
								<input
									type="text"
									placeholder="Add tags..."
									value={editTagsToAdd}
									onChange={(e) => setEditTagsToAdd(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleAddTagsToEdit();
									}}
									className="flex-1 p-3 bg-[#f0f0f0] border-4 border-black text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
								/>
								<button
									onClick={handleAddTagsToEdit}
									disabled={!editTagsToAdd.trim()}
									className="px-6 py-3 bg-black text-[#A3FF12] font-black uppercase disabled:opacity-50 border-4 border-black hover:bg-white hover:text-black transition-colors"
									type="button"
								>
									Add
								</button>
							</div>
						</div>

						<div className="flex gap-4 border-t-8 border-black pt-8">
							<button
								onClick={handleSaveEdit}
								className="flex-1 py-4 bg-black text-[#A3FF12] font-black uppercase text-xl border-4 border-black hover:bg-white hover:text-black hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all"
								type="button"
							>
								Save
							</button>
							<button
								onClick={() => setEditingPoster(null)}
								className="flex-1 py-4 bg-white text-black font-black uppercase text-xl border-4 border-black hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all"
								type="button"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Tag selector modal */}
			{tagModalPoster && (
				<div 
					className="fixed inset-0 bg-[#A3FF12]/90 flex items-center justify-center z-50 p-4"
					onClick={() => setTagModalPoster(null)}
				>
					<div 
						className="bg-white p-8 w-full max-w-md border-8 border-black shadow-[16px_16px_0_0_#000] max-h-[80vh] flex flex-col relative"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							onClick={() => setTagModalPoster(null)}
							className="absolute top-6 right-6 text-black hover:text-[#A3FF12] text-4xl font-black transition-colors leading-none"
							type="button"
						>
							✕
						</button>

						<h2 className="text-3xl font-black uppercase text-black mb-2 border-b-8 border-black pb-4 inline-block">Add Tags</h2>

						<p className="text-xl font-bold text-black/60 mb-8 truncate uppercase">
							{tagModalPoster.title}
						</p>

						{/* Create new tag (Moved to top) */}
						<div className="mb-8 pb-8 border-b-4 border-black shrink-0">
							<div className="flex flex-col sm:flex-row gap-4">
								<input
									type="text"
									value={newTagName}
									onChange={(e) => setNewTagName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreateTag();
									}}
									placeholder="Add tags..."
									className="flex-1 p-3 bg-[#f0f0f0] border-4 border-black text-black font-bold uppercase placeholder-black/50 focus:outline-none focus:bg-[#A3FF12] transition-colors"
								/>
								<button
									onClick={handleCreateTag}
									disabled={creatingTag || !newTagName.trim()}
									className="px-6 py-3 bg-black text-[#A3FF12] font-black uppercase disabled:opacity-50 border-4 border-black hover:bg-white hover:text-black transition-colors"
									type="button"
								>
									{creatingTag ? "..." : "+ Add"}
								</button>
							</div>
						</div>

						{/* Tag list */}
						<div className="space-y-4 overflow-y-auto pr-2 pb-2">
							{allTags.map((tag) => {
								const isSelected = (tagModalPoster.tags || []).includes(tag);
								return (
									<button
										key={tag}
										onClick={() => handleToggleTag(tag)}
										className={`w-full text-left px-6 py-4 border-4 border-black text-lg font-black uppercase tracking-widest transition-all ${
											isSelected
												? "bg-[#A3FF12] text-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]"
												: "bg-white text-black hover:bg-[#f0f0f0]"
										}`}
										type="button"
									>
										{isSelected && <span className="mr-4 inline-block border-2 border-black bg-white px-2">✓</span>}
										{tag}
									</button>
								);
							})}

							{allTags.length === 0 && (
								<p className="text-black/50 text-xl font-bold text-center py-4 uppercase border-4 border-black p-4">
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
