export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import JSZip from "jszip";
import { getAdminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";
import admin from "firebase-admin";

const PRICE_PER_IMAGE = 40;

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  return ext ? `.${ext}` : "";
}

function isImageExtension(ext: string): boolean {
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext.toLowerCase());
}

function getContentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function extractFilename(fullPath: string): string {
  const parts = fullPath.split(/[/\\]/);
  return parts.pop() || "image.png";
}

function isMacOrHidden(fullPath: string, fileName: string): boolean {
  const lower = fullPath.toLowerCase();
  if (lower.includes("__macosx/") || lower.includes("__macosx\\")) return true;
  if (fileName.startsWith(".") || fileName.startsWith("._")) return true;
  return false;
}

function sanitizeFilename(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const notes = (formData.get("notes") as string) || "";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const imageBuffers: { name: string; buffer: Buffer }[] = [];

    for (const file of files) {
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const isZip = file.name.toLowerCase().endsWith(".zip");

      if (isZip) {
        let zip: JSZip;
        try {
          zip = await JSZip.loadAsync(buffer);
        } catch (zipErr) {
          console.error(`Failed to parse ZIP file ${file.name}:`, zipErr);
          return NextResponse.json(
            { error: `The ZIP file "${file.name}" is invalid or corrupted.` },
            { status: 400 }
          );
        }

        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue;

          const fileName = extractFilename(relativePath);
          if (isMacOrHidden(relativePath, fileName)) continue;

          const ext = getFileExtension(fileName);
          if (isImageExtension(ext)) {
            const fileBuffer = await zipEntry.async("nodebuffer");
            imageBuffers.push({
              name: fileName,
              buffer: fileBuffer,
            });
          }
        }
      } else {
        const fileName = extractFilename(file.name);
        if (isMacOrHidden(file.name, fileName)) continue;

        const ext = getFileExtension(fileName);
        if (isImageExtension(ext)) {
          imageBuffers.push({
            name: fileName,
            buffer: buffer,
          });
        }
      }
    }

    if (imageBuffers.length === 0) {
      return NextResponse.json(
        { error: "No valid images found in the upload. Only JPG, JPEG, PNG, and WEBP are supported." },
        { status: 400 }
      );
    }

    const customOrderId = crypto.randomUUID();
    const uploadedUrls: string[] = [];

    // Upload concurrently in batches of 5 to avoid timeouts & rate limits
    const CHUNK_SIZE = 5;
    for (let i = 0; i < imageBuffers.length; i += CHUNK_SIZE) {
      const chunk = imageBuffers.slice(i, i + CHUNK_SIZE);
      const chunkUrls = await Promise.all(
        chunk.map(async (img, idx) => {
          const index = i + idx;
          const safeName = sanitizeFilename(img.name);
          const blobPath = `custom-orders/${customOrderId}/${Date.now()}-${index}-${safeName}`;
          const contentType = getContentType(safeName);

          const blob = await put(blobPath, img.buffer, {
            access: "public",
            contentType,
          });
          return blob.url;
        })
      );
      uploadedUrls.push(...chunkUrls);
    }

    const totalImages = uploadedUrls.length;
    const originalPrice = totalImages * PRICE_PER_IMAGE;
    const totalPrice = originalPrice;
    const discountApplied = 0;

    const db = getAdminDb();

    await db.collection("customOrders").doc(customOrderId).set({
      id: customOrderId,
      totalImages,
      pricePerImage: PRICE_PER_IMAGE,
      totalPrice,
      originalPrice,
      discountApplied,
      couponCode: null,
      images: uploadedUrls,
      notes,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      customOrderId,
      images: uploadedUrls,
      totalImages,
      totalPrice,
      originalPrice,
      discountApplied,
      couponCode: null,
    });
  } catch (error) {
    console.error("Failed to upload custom order:", error);
    const message = error instanceof Error ? error.message : "Failed to process upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
