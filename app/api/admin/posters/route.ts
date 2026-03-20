import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminDb, getAdminAuth, getAdminStorage } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

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

    // 5️⃣ Upload image to Firebase Storage
    const buffer = Buffer.from(await image.arrayBuffer());
    const ext = image.type === "image/png" ? "png" : "jpg";
    const filename = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")}-${Date.now()}.${ext}`;

    const bucket = getAdminStorage();
    const file = bucket.file(`posters/${filename}`);

    await file.save(buffer, {
      metadata: {
        contentType: image.type,
      },
    });

    // Make the file publicly readable
    await file.makePublic();

    const imagePath = `https://storage.googleapis.com/${bucket.name}/posters/${filename}`;

    // 6️⃣ Create Firestore doc
    await adminDb.collection("posters").add({
      title,
      price: Number(price),
      imagePath,
      isActive: true,
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
