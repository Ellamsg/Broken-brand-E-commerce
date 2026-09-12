import User from "@/models/User";
import connect from "@/utils/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { name, email, password } = body;

  if (!name || !email || !password) {
    return new NextResponse(
      JSON.stringify({ error: "Name, email, and password are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    await connect();
  } catch (dbError) {
    console.error("DB connection failed:", dbError);
    return new NextResponse(
      JSON.stringify({ error: "Database connection failed. Please try again later." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { name }] });
    if (existing) {
      return new NextResponse(
        JSON.stringify({ error: "An account with that email or username already exists." }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return new NextResponse(
      JSON.stringify({ message: "Account created successfully" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Register error:", err);
    // Mongoose duplicate key error
    if (err.code === 11000) {
      return new NextResponse(
        JSON.stringify({ error: "An account with that email or username already exists." }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: err.message || "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};