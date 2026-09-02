"use client";

import { useState, useRef, useEffect } from "react";
import { buttons } from "@/lib/ui/buttons";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const LOADING_PHRASES = [
  "Assembling the Avengers...",
  "Warming up the DeLorean...",
  "Hacking into the Matrix...",
  "Waiting for Goku to finish charging his attack...",
  "Waiting for Rizul to fix the servers...",
  "Downloading more RAM...",
  "Asking AI to make this faster...",
  "Pixelating the pixels...",
  "Reversing the polarity of the neutron flow...",
  "Aligning the cosmic rays with your posters...",
  "Bribing the upload gremlins with snacks...",
  "Running out of loading screen ideas...",
  "Are we there yet? No. But soon...",
];

export default function CustomOrderClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      interval = setInterval(() => {
        setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const [uploadResult, setUploadResult] = useState<{
    customOrderId: string;
    images: string[];
    totalImages: number;
    totalPrice: number;
    originalPrice?: number;
    discountApplied?: number;
    couponCode?: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragError, setDragError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const { addToCart } = useCart();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: File[]) => {
    const valid = fileList.filter((f) => {
      const ext = f.name.toLowerCase().split('.').pop();
      return ext === "zip" || ext === "jpg" || ext === "jpeg" || ext === "png";
    });
    if (valid.length !== fileList.length) {
      setDragError("Some files were ignored. Only JPG, PNG, or ZIP allowed.");
    } else {
      setDragError("");
    }
    return valid;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !uploadResult) return;
    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/custom-orders/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customOrderId: uploadResult.customOrderId, 
          couponCode 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon");
      } else {
        setUploadResult({
          ...uploadResult,
          totalPrice: data.totalPrice,
          originalPrice: data.originalPrice,
          discountApplied: data.discountApplied,
          couponCode: data.couponCode
        });
        setCouponError("");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Failed to apply coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = validateFiles(Array.from(e.target.files));
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = validateFiles(Array.from(e.dataTransfer.files));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setDragError("You should add something here first");
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    setIsUploading(true);
    setUploadStatusText("Uploading files...");

    // Check if zip is included to show specific status
    const hasZip = files.some(f => f.name.toLowerCase().endsWith('.zip'));
    if (hasZip) {
      setTimeout(() => setUploadStatusText("Processing ZIP - counting images..."), 1000);
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("notes", notes);

    try {
      const res = await fetch("/api/custom-orders/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Upload failed");
      } else {
        setUploadResult(data);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
    }
  };

  const handleAddToCart = () => {
    if (!uploadResult) return;

    addToCart({
      type: "custom",
      id: uploadResult.customOrderId,
      title: `Custom posters (${uploadResult.totalImages} images)`,
      price: uploadResult.totalPrice,
      imagesCount: uploadResult.totalImages,
      imagePath: uploadResult.images[0] || "/posters/default-cover.jpg",
    });

    router.push("/cart");
  };

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-24">
      {/* SECTION 1: HERO */}
      <section className="px-6 py-20 border-b-8 border-black bg-white text-center">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black drop-shadow-[4px_4px_0_#A3FF12]">
          Your wall. Your design.
        </h1>
        <p className="mt-6 text-lg font-bold text-black max-w-2xl mx-auto">
          Got something in mind that isn't in the shop? We'll print it for you. <br className="hidden sm:block" /> ₹40 per poster, A4 size, no minimums.
        </p>
      </section>

      {/* SECTION 2: INSTRUCTIONS */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Step-by-step pills */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black text-[#A3FF12] text-2xl font-black border-4 border-black shadow-[4px_4px_0_0_#A3FF12] rounded-full z-10 relative">1</div>
            <span className="font-black uppercase tracking-widest text-lg">Prepare your designs</span>
          </div>

          <div className="hidden md:block h-1 w-16 bg-black"></div>
          <div className="md:hidden w-1 h-8 bg-black"></div>

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black text-[#A3FF12] text-2xl font-black border-4 border-black shadow-[4px_4px_0_0_#A3FF12] rounded-full z-10 relative">2</div>
            <span className="font-black uppercase tracking-widest text-lg">Choose how to submit</span>
          </div>

          <div className="hidden md:block h-1 w-16 bg-black"></div>
          <div className="md:hidden w-1 h-8 bg-black"></div>

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-black text-[#A3FF12] text-2xl font-black border-4 border-black shadow-[4px_4px_0_0_#A3FF12] rounded-full z-10 relative">3</div>
            <span className="font-black uppercase tracking-widest text-lg">Pay & we print</span>
          </div>
        </div>

        {/* Design Requirements Checklist Card */}
        <div className="border-4 border-black p-8 bg-white shadow-[12px_12px_0_0_#000]">
          <h2 className="text-2xl font-black uppercase tracking-widest text-black mb-6 pb-2 border-b-4 border-[#A3FF12] inline-block">
            Design Requirements
          </h2>
          <ul className="space-y-4 font-bold text-lg">
            <li className="flex items-start gap-3">
              <span className="text-[#A3FF12] text-2xl leading-none font-black drop-shadow-[1px_1px_0_#000]">✓</span>
              <div><strong className="uppercase">Format:</strong> JPEG or PNG files, or a ZIP of multiple images</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A3FF12] text-2xl leading-none font-black drop-shadow-[1px_1px_0_#000]">✓</span>
              <div><strong className="uppercase">Size:</strong> A4 dimensions (2480 × 3508 px at 300dpi recommended for best print quality)</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A3FF12] text-2xl leading-none font-black drop-shadow-[1px_1px_0_#000]">✓</span>
              <div><strong className="uppercase">Resolution:</strong> Higher is better - low-res images may print blurry, and we'll let you know if that happens</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A3FF12] text-2xl leading-none font-black drop-shadow-[1px_1px_0_#000]">✓</span>
              <div><strong className="uppercase">Content:</strong> Make sure you own the rights to whatever you're printing</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A3FF12] text-2xl leading-none font-black drop-shadow-[1px_1px_0_#000]">✓</span>
              <div><strong className="uppercase">ZIP files:</strong> Only image files inside - other file types will be ignored automatically</div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#A3FF12] text-2xl leading-none font-black drop-shadow-[1px_1px_0_#000]">✓</span>
              <div><strong className="uppercase">Pricing:</strong> ₹40 per image, calculated automatically when you upload</div>
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 3: TWO OPTIONS */}
      <section className="max-w-3xl mx-auto px-6 flex flex-col gap-12">

        {/* CARD A: SELF-SERVE */}
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_black] flex flex-col h-full">
          <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-3">
            Upload your designs yourself
          </h2>
          <p className="text-black font-bold mb-8">
            Upload JPEGs, PNGs, or a ZIP and we'll count your images, <br className="hidden sm:block" /> calculate the price, and add it to your cart. Done in under a minute.
          </p>

          <div className="flex-1 flex flex-col justify-end">
            {!uploadResult ? (
              <div className="flex flex-col">
                <div
                  className={`border-4 border-dashed p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[200px] mb-4 ${
                    shakeError ? "animate-shake border-red-500 bg-red-50" :
                    dragOver ? "border-[#A3FF12] bg-[#A3FF12]/10" : "border-black hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {files.length === 0 ? (
                    <>
                      <span className="font-black text-xl mb-2 uppercase">Drag & Drop files here</span>
                      <span className="text-sm font-bold text-gray-600 mb-4">or click to browse (.jpg, .png, .zip)</span>
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-black text-[#A3FF12] px-4 py-2 font-black uppercase tracking-widest text-sm border-2 border-black">
                          {files.length} file(s) selected
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="bg-white text-black border-2 border-black px-4 py-2 font-black uppercase tracking-widest text-sm hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] transition-all"
                        >
                          Add more
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2" onClick={(e) => e.stopPropagation()}>
                        {files.map((file, idx) => {
                          const isZip = file.name.toLowerCase().endsWith(".zip");
                          return (
                            <div key={idx} className="relative group border-2 border-black aspect-square bg-white flex flex-col items-center justify-center overflow-hidden">
                              {isZip ? (
                                <div className="text-center p-2">
                                  <div className="text-3xl mb-1">📦</div>
                                  <div className="text-xs font-bold truncate w-full px-1">{file.name}</div>
                                </div>
                              ) : (
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                              )}
                              
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFiles(files.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white border-2 border-black flex items-center justify-center font-black rounded-full hover:bg-red-600 shadow-[2px_2px_0_0_#000] z-20 cursor-pointer pointer-events-auto"
                                aria-label="Remove file"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.zip"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {dragError && (
                  <p className="text-red-600 font-bold mb-4 text-sm px-4 py-2 bg-red-100 border-2 border-red-600 inline-block">{dragError}</p>
                )}

                <div className="mb-6">
                  <label className="block text-black font-black uppercase tracking-widest text-sm mb-2">Instructions / Notes for us (Optional)</label>
                  <textarea
                    placeholder="E.g., Please print the Spiderman one slightly darker, or ignore the white borders..."
                    className="w-full p-4 border-4 border-black bg-gray-50 text-black font-bold focus:outline-none focus:bg-[#A3FF12]/10 transition-colors resize-y min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isUploading}
                  />
                </div>


                {isUploading && (
                  <div className="mb-6 border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#A3FF12] text-center w-full">
                    <div className="flex justify-center mb-4">
                      <div className="w-10 h-10 border-8 border-[#f0f0f0] border-t-[#A3FF12] border-r-black rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-lg font-black uppercase text-black animate-pulse mb-2">
                      {loadingPhrase}
                    </h2>
                    <div className="w-full bg-gray-200 border-2 border-black h-4 relative overflow-hidden mt-4">
                      <div className="absolute top-0 left-0 h-full bg-[#A3FF12] w-full"></div>
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase text-black/60">{uploadStatusText}</p>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`${buttons.primary} w-full ${files.length === 0 || isUploading ? "opacity-50" : ""}`}
                >
                  Upload & add to cart
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="bg-black text-white p-4 font-black uppercase text-xl mb-6 border-4 border-black shadow-[4px_4px_0_0_#A3FF12]">
                  <div className="flex justify-between items-center">
                    <span>
                      {uploadResult.totalImages} images × ₹40
                    </span>
                    <span className={uploadResult.discountApplied ? "line-through opacity-50 text-sm" : "text-[#A3FF12]"}>
                      ₹{uploadResult.originalPrice || (uploadResult.totalImages * 40)}
                    </span>
                  </div>
                  
                  {uploadResult.discountApplied && uploadResult.discountApplied > 0 && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20">
                      <span className="text-[#A3FF12] text-sm flex items-center gap-2">
                        <span className="bg-[#A3FF12] text-black px-1">CODE: {uploadResult.couponCode}</span>
                        Discount Applied!
                      </span>
                      <span className="text-[#A3FF12] font-black">
                        ₹{uploadResult.totalPrice}
                      </span>
                    </div>
                  )}
                </div>

                {!uploadResult.discountApplied && (
                  <div className="mb-6 p-4 border-4 border-black bg-[#A3FF12]/20">
                    <label className="block text-black font-black uppercase tracking-widest text-sm mb-2">Get a discount by proving how well you know rizul</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter secret code"
                        className="w-full p-3 border-4 border-black bg-white text-black font-bold uppercase focus:outline-none focus:bg-[#A3FF12]/50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={isValidatingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode}
                        className="bg-black text-[#A3FF12] px-4 font-black uppercase border-4 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[2px] transition-transform"
                      >
                        {isValidatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 font-bold mt-2 text-sm uppercase">{couponError}</p>}
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto max-h-[250px] mb-6 p-3 border-4 border-black bg-gray-50">
                  {uploadResult.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Uploaded preview ${idx + 1}`}
                      className="w-full h-auto aspect-[1/1.4] object-cover border-2 border-black"
                    />
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button
                    onClick={() => { setUploadResult(null); setFiles([]); }}
                    className="px-4 py-3 font-black uppercase text-black border-4 border-black bg-white hover:bg-gray-100 transition-colors flex-1 text-center text-sm"
                  >
                    Something's wrong → Remove & retry
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className={`${buttons.primary} flex-1 text-center text-sm`}
                  >
                    Looks right → Add to cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD B: PERSONAL */}
        {/* Using a warm subtle yellow/cream background with a slightly different typographic treatment */}
        <div className="border-4 border-black bg-[#FFFBEA] p-8 shadow-[8px_8px_0_0_black] flex flex-col h-full relative overflow-hidden">
          {/* subtle decoration to distinguish the "human" path */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#A3FF12] rounded-full blur-3xl opacity-50"></div>

          <h2 className="text-4xl font-bold tracking-tight text-black mb-3 italic" style={{ fontFamily: "Georgia, serif" }}>
            Need some help?
          </h2>
          <div className="text-black font-bold mb-8 text-lg relative z-10 leading-relaxed space-y-4">
            <p>
              That's fine, Rizul isn't busy. <span className="opacity-70">(He's very busy. But not for you.)</span>
            </p>
            <p>
              He's the founder and CEO of WCN, which sounds fancy until you realise he's a college kid who started this by putting posters on his hostel room walls.
            </p>
            <p>
              He personally handles every single custom request that comes his way, just because he genwin-ly loves to. So don't overthink it. Send him a message, tell him whatever's on your mind, and figure it out together.
            </p>
          </div>

          <div className="flex-1 flex items-end justify-start relative z-10">
            <a
              href="https://wa.me/919306553798?text=Hi%20I%20want%20some%20custom%20posters"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-[#A3FF12] border-4 border-black px-6 py-4 w-full text-xl font-black uppercase tracking-widest hover:-translate-y-1 hover:translate-x-1 transition-transform shadow-[4px_4px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] text-center"
            >
              Chat with the CEO
            </a>
          </div>
        </div>

        {/* CARD C: COMING SOON */}
        <div className="border-4 border-black border-dashed bg-gray-50 p-6 flex items-center justify-center text-center opacity-70">
          <span className="font-black uppercase tracking-widest text-black/60">Polaroid self-help coming soon 📸</span>
        </div>

      </section>
    </main>
  );
}
