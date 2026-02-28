"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Poster = {
	id: string;
	title: string;
	price: number;
	imagePath: string;
	isActive: boolean;
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
		if (uploads.length === 0) return;
		setUploading(true);
		for (const item of uploads) {
			const fd = new FormData();
			fd.append("file", item.file);
			fd.append("title", item.title);
			fd.append("price", item.price);
			// Assumes you have a POST /api/admin/posters endpoint to handle file upload + metadata
			await fetch("/api/admin/posters", {
				method: "POST",
				body: fd,
			});
		}
		setUploading(false);
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

						<div className="flex gap-2 mt-3">
							<button
								onClick={() => setEditingPoster(poster)}
								className="flex-1 px-2 py-1 text-sm rounded-md bg-green-600 text-black hover:bg-green-700"
								type="button"
							>
								Edit
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
		</div>
	);
}
