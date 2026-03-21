import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { put } from "@vercel/blob";

const adminDb = getAdminDb();
const adminAuth = getAdminAuth();

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1️⃣ Read session cookie (App Router SAFE way)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify session
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    // 3️⃣ Check admin role from Firestore
    const userSnap = await adminDb.collection("users").doc(uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4️⃣ Parse form data
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File;
    const tagsString = formData.get("tags") as string;
    const tagsArr = tagsString ? tagsString.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [];

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

    // 5️⃣ Upload image to Vercel Blob Storage
    const ext = image.type === "image/png" ? "png" : "jpg";
    const filename = `posters/${title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}-${Date.now()}.${ext}`;

    const blob = await put(filename, image, {
      access: "public",
      contentType: image.type,
    });

    const imagePath = blob.url;

    // 5.1 Ensure tags exist in tags collection
    if (tagsArr.length > 0) {
      for (const tag of tagsArr) {
        const tagRef = adminDb.collection("tags").doc(tag);
        const tagDoc = await tagRef.get();
        if (!tagDoc.exists) {
          await tagRef.set({
            name: tag,
            createdAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    // 6️⃣ Create Firestore doc
    await adminDb.collection("posters").add({
      title,
      price: Number(price),
      imagePath,
      isActive: true,
      tags: tagsArr,
      createdAt: FieldValue.serverTimestamp(),
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

export async function GET() {
	const snapshot = await getAdminDb().collection("posters").orderBy("createdAt", "desc").get();

	const posters = snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));

	return NextResponse.json({ posters });
}
