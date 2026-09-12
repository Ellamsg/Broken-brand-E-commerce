import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

// Server-side Sanity client — uses secret token, never exposed to the browser
const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-11-21",
  token: process.env.SANITY_API_SECRET_TOKEN, // Use a server-only token here (not NEXT_PUBLIC_)
  useCdn: false,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { reference, email, cart } = body;

    // 1. Guard: make sure we received all required data
    if (!reference || !email || !cart || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // 2. Verify the payment with Paystack's servers using the SECRET key
    //    This call happens server-side, so the secret key is never exposed to the browser
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackRes.json();

    // 3. Check that Paystack says the payment is actually successful
    if (
      !paystackData.status ||
      paystackData.data?.status !== "success"
    ) {
      console.error("Paystack verification failed:", paystackData);
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed. No order was created.",
          paystackStatus: paystackData.data?.status,
        },
        { status: 402 }
      );
    }

    // 4. Optionally: check that the amount paid matches what we expect
    //    paystackData.data.amount is in kobo (same as your cartTotal)
    // const expectedAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // if (paystackData.data.amount !== expectedAmount) {
    //   return NextResponse.json({ success: false, message: "Amount mismatch." }, { status: 402 });
    // }

    // 5. Check for duplicate orders: make sure this reference hasn't been used before
    const existing = await serverClient.fetch(
      `*[_type == "order" && paystackReference == $reference][0]`,
      { reference }
    );

    if (existing) {
      // Payment was already processed — safe to return success (idempotent)
      return NextResponse.json({
        success: true,
        message: "Order already exists for this payment.",
        alreadyProcessed: true,
      });
    }

    // 6. Payment is verified and not a duplicate — create the orders in Sanity
    const orderCreationPromises = cart.map((orderData) => {
      const { name, quantity, size, price, image2 } = orderData;
      return serverClient.create({
        _type: "order",
        name,
        qty: quantity,
        price,
        image2,
        sizes: size,
        paid: true,
        delivered: false,
        email: email,
        paystackReference: reference, // Store reference to prevent duplicate orders
        createdAt: new Date().toISOString(),
      });
    });

    const createdOrders = await Promise.all(orderCreationPromises);

    return NextResponse.json({
      success: true,
      message: "Payment verified and order created successfully.",
      orders: createdOrders,
    });
  } catch (error) {
    console.error("Error in /api/verify-payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
