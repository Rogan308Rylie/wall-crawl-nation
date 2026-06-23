export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import JSZip from "jszip";
import { getAdminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";
import admin from "firebase-admin";

const PRICE_PER_IMAGE = 40;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const notes = formData.get("notes") as string || "";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const imageBuffers: { name: string; buffer: Buffer }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.toLowerCase().endsWith(".zip")) {
        const zip = await JSZip.loadAsync(buffer);
        
        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue;
          
          const lowerPath = relativePath.toLowerCase();
          if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg") || lowerPath.endsWith(".png")) {
            // macOS sometimes creates __MACOSX directories, ignore them
            if (lowerPath.includes("__macosx/")) continue;
            
            const fileBuffer = await zipEntry.async("nodebuffer");
            imageBuffers.push({
              name: relativePath.split("/").pop() || "image.png",
              buffer: fileBuffer,
            });
          }
        }
      } else {
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png")) {
          imageBuffers.push({
            name: file.name,
            buffer: buffer,
          });
        }
      }
    }

    if (imageBuffers.length === 0) {
      return NextResponse.json({ error: "No valid images found in the upload" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const customOrderId = crypto.randomUUID();

    for (const img of imageBuffers) {
      // Use customOrderId in path to group them nicely
      const blobPath = `custom-orders/${customOrderId}/${Date.now()}-${img.name}`;
      const blob = await put(blobPath, img.buffer, {
        access: "public",
        contentType: img.name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
      });
      uploadedUrls.push(blob.url);
    }

    const totalImages = uploadedUrls.length;
    const totalPrice = totalImages * PRICE_PER_IMAGE;

    const db = getAdminDb();
    
    await db.collection("customOrders").doc(customOrderId).set({
      id: customOrderId,
      totalImages,
      pricePerImage: PRICE_PER_IMAGE,
      totalPrice,
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
    });
  } catch (error) {
    console.error("Failed to upload custom order:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
