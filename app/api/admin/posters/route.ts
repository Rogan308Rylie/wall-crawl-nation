import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { serverTimestamp } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const adminDb = getAdminDb();
export async function POST(req: Request) {
  try {
    // 🔐 Admin auth check
    const auth = getAdminAuth();
    const sessionCookie = req.headers
      .get("cookie")
      ?.match(/__session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 📦 Parse form data
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File;

    if (!title || !price || !image) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (!["image/jpeg", "image/png"].includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 }
      );
    }

    // 🖼 Save image to /public/posters
    const buffer = Buffer.from(await image.arrayBuffer());
    const ext = image.type === "image/png" ? "png" : "jpg";
    const filename = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}-${Date.now()}.${ext}`;

    const postersDir = path.join(process.cwd(), "public", "posters");
    if (!fs.existsSync(postersDir)) {
      fs.mkdirSync(postersDir, { recursive: true });
    }

    fs.writeFileSync(path.join(postersDir, filename), buffer);

    const imagePath = `/posters/${filename}`;

    // 🔥 Write Firestore doc
    await adminDb.collection("posters").add({
      title,
      price: Number(price),
      imagePath,
      isActive: true,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Add poster error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
