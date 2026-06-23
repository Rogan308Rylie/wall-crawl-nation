export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";
import admin from "firebase-admin";

export function calculateDeliveryFee(
  cartTotal: number,
  isFirstTimeCustomer: boolean,
  isNITKKR: boolean
): number {
  if (isNITKKR) return 0;
  if (isFirstTimeCustomer) return 80;

  if (cartTotal < 150) {
    return 80;
  }
  if (cartTotal < 350) {
    return 80;
  }
  return 50;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, deliveryAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!deliveryAddress) {
      return NextResponse.json({ error: "Missing delivery address" }, { status: 400 });
    }

    const db = getAdminDb();
    let cartTotal = 0;
    const validatedItems = [];

    // Fetch REAL prices from the database
    for (const item of items) {
      if (!item.id || !item.type || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
      }

      if (item.type === "poster") {
        const docSnap = await db.collection("posters").doc(item.id).get();
        if (!docSnap.exists) {
          return NextResponse.json({ error: `Poster ${item.id} not found` }, { status: 404 });
        }
        const realPrice = docSnap.data()!.price;
        cartTotal += realPrice * item.quantity;
        validatedItems.push({
          ...item,
          price: realPrice,
          title: docSnap.data()!.title,
        });
      } else if (item.type === "collection") {
        const docSnap = await db.collection("collections").doc(item.id).get();
        if (!docSnap.exists) {
          return NextResponse.json({ error: `Collection ${item.id} not found` }, { status: 404 });
        }
        const realPrice = docSnap.data()!.discountedPrice;
        cartTotal += realPrice * item.quantity;
        validatedItems.push({
          ...item,
          price: realPrice,
          title: docSnap.data()!.title,
        });
      } else if (item.type === "custom") {
        const docSnap = await db.collection("customOrders").doc(item.id).get();
        if (!docSnap.exists) {
          return NextResponse.json({ error: `Custom order ${item.id} not found` }, { status: 404 });
        }
        const customData = docSnap.data()!;
        const realPrice = customData.totalPrice; // Total price of all images in that custom order
        cartTotal += realPrice * item.quantity;
        validatedItems.push({
          ...item,
          price: realPrice,
          title: `Custom posters (${customData.totalImages} images)`,
          images: customData.images || [],
          notes: customData.notes || "",
        });
      } else {
        return NextResponse.json({ error: "Unknown item type" }, { status: 400 });
      }
    }

    // Determine if returning customer to calculate delivery
    const pastOrdersSnap = await db
      .collection("orders")
      .where("userId", "==", uid)
      .where("status", "==", "confirmed")
      .limit(1)
      .get();

    const isFirstTimeCustomer = pastOrdersSnap.empty;
    const isNITKKR = !!deliveryAddress.isNitkkr;

    // Check returning customer minimum limit (handled on client, but good to enforce on server)
    if (!isFirstTimeCustomer && cartTotal < 150) {
      return NextResponse.json({ error: "Returning customers must place an order of at least ₹150" }, { status: 400 });
    }

    const deliveryFee = calculateDeliveryFee(cartTotal, isFirstTimeCustomer, isNITKKR);
    const totalAmount = cartTotal + deliveryFee;

    const orderId = crypto.randomUUID();

    await db.collection("orders").doc(orderId).set({
      orderId,
      userId: uid,
      items: validatedItems,
      cartTotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      status: "pending",
      paymentStatus: "created",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, orderId, totalAmount });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
