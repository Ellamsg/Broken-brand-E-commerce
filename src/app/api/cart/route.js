// /api/cart/route.js
// GET  → fetch all cart items for the logged-in user
// POST → add or update a cart item (upsert by userEmail + productId + size)
// DELETE → remove a specific item OR clear entire cart

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createClient } from "next-sanity";

const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-11-21",
  token: process.env.SANITY_API_SECRET_TOKEN,
  useCdn: false,
});

// ─── GET: load cart for logged-in user ───────────────────────────────────────
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;

    const cartItems = await serverClient.fetch(
      `*[_type == "cart" && userEmail == $email] | order(updatedAt desc) {
        _id,
        productId,
        name,
        price,
        image2,
        slug,
        size,
        quantity
      }`,
      { email }
    );

    return NextResponse.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ success: false, message: "Failed to load cart" }, { status: 500 });
  }
}

// ─── POST: add or update a cart item ─────────────────────────────────────────
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;
    const body = await req.json();
    const { productId, name, price, image2, slug, size, quantity } = body;

    if (!productId || !size || quantity === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if this exact item (same user + product + size) already exists
    const existing = await serverClient.fetch(
      `*[_type == "cart" && userEmail == $email && productId == $productId && size == $size][0]`,
      { email, productId, size }
    );

    if (existing) {
      // Update quantity — add to existing qty
      const newQty = existing.quantity + parseInt(quantity, 10);

      if (newQty <= 0) {
        // Remove item if quantity drops to 0
        await serverClient.delete(existing._id);
        return NextResponse.json({ success: true, action: "removed" });
      }

      const updated = await serverClient.patch(existing._id)
        .set({ quantity: newQty, updatedAt: new Date().toISOString() })
        .commit();

      return NextResponse.json({ success: true, action: "updated", item: updated });
    } else {
      // Create new cart item
      if (parseInt(quantity, 10) <= 0) {
        return NextResponse.json({ success: true, action: "skipped" });
      }

      const created = await serverClient.create({
        _type: "cart",
        userEmail: email,
        productId,
        name,
        price,
        image2,
        slug,
        size,
        quantity: parseInt(quantity, 10),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, action: "created", item: created });
    }
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: false, message: "Failed to update cart" }, { status: 500 });
  }
}

// ─── DELETE: remove one item or clear entire cart ────────────────────────────
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const email = session.user.email;
    const { searchParams } = new URL(req.url);
    const sanityId = searchParams.get("id");   // pass ?id=_id to delete one item
    const clearAll = searchParams.get("clear"); // pass ?clear=true to wipe cart

    if (clearAll === "true") {
      // Fetch all items for this user and delete them
      const items = await serverClient.fetch(
        `*[_type == "cart" && userEmail == $email]{ _id }`,
        { email }
      );
      await Promise.all(items.map((item) => serverClient.delete(item._id)));
      return NextResponse.json({ success: true, action: "cleared" });
    }

    if (sanityId) {
      await serverClient.delete(sanityId);
      return NextResponse.json({ success: true, action: "deleted" });
    }

    return NextResponse.json({ success: false, message: "No id or clear flag provided" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete cart item" }, { status: 500 });
  }
}
