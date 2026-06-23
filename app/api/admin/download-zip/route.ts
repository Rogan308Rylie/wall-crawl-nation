export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import JSZip from "jszip";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Authenticate Admin
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const db = getAdminDb();
    
    // Check if admin
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch order
    const orderDoc = await db.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderDoc.data()!;
    const customImages: string[] = [];

    // Extract all custom images from all custom items in the order
    for (const item of orderData.items) {
      if (item.type === "custom" && item.images) {
        customImages.push(...item.images);
      }
    }

    if (customImages.length === 0) {
      return NextResponse.json({ error: "No custom images found in this order" }, { status: 400 });
    }

    const zip = new JSZip();

    // Fetch each image and add to zip
    for (let i = 0; i < customImages.length; i++) {
      const imgUrl = customImages[i];
      const res = await fetch(imgUrl);
      if (!res.ok) {
        console.error(`Failed to fetch image ${imgUrl}`);
        continue;
      }
      const buffer = await res.arrayBuffer();
      // Determine extension from url if possible, otherwise default to .jpg
      let ext = "jpg";
      if (imgUrl.toLowerCase().includes(".png")) ext = "png";
      
      zip.file(`custom_image_${i + 1}.${ext}`, buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="order_${orderId}_custom_images.zip"`,
      },
    });

  } catch (error) {
    console.error("Failed to generate zip:", error);
    return NextResponse.json({ error: "Failed to generate zip" }, { status: 500 });
  }
}
