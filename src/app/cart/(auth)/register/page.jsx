"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Register = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        router.push("/cart/login?success=Account has been created");
      } else if (res.status === 409) {
        setError(data.error || "An account with that email or username already exists.");
      } else if (res.status === 503) {
        setError("Service temporarily unavailable. Please try again in a moment.");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space min-h-screen flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-[440px]">

        {/* Header */}
        <div className="mb-8 border-b-2 border-white pb-5">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Create Account</h1>
          <p className="text-xs uppercase tracking-widest text-gray mt-2">Join the brand</p>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red/50 bg-red/10 px-4 py-3 mb-6 text-xs uppercase tracking-wider text-red">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-gray">Username</label>
            <input
              required
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 text-white text-sm transition-colors duration-200 placeholder:text-white/30"
              type="text"
              placeholder="your username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-gray">Email</label>
            <input
              required
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 text-white text-sm transition-colors duration-200 placeholder:text-white/30"
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-gray">Password</label>
            <input
              required
              minLength={6}
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 text-white text-sm transition-colors duration-200 placeholder:text-white/30"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="mt-4 py-3 px-6 border-2 border-white text-white text-xs uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-xs uppercase tracking-widest text-gray mt-8">
          Already have an account?{" "}
          <Link href="/cart/login" className="text-white hover:underline underline-offset-4 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
