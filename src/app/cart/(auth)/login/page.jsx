"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const Login = () => {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (session.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session.status === "authenticated") {
    router?.push("/cart");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/cart");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space min-h-screen flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-[440px]">

        {/* Header */}
        <div className="mb-8 border-b-2 border-white pb-5">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">Sign In</h1>
          <p className="text-xs uppercase tracking-widest text-gray mt-2">Access your account</p>
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
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none py-3 text-white text-sm transition-colors duration-200 placeholder:text-white/30"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="mt-4 py-3 px-6 border-2 border-white text-white text-xs uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-xs uppercase tracking-widest text-gray">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-white/40 text-white text-xs uppercase tracking-widest hover:border-white hover:bg-white/5 transition-colors duration-200 cursor-pointer"
        >
          <img src="/icons/google.svg" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>

        {/* Register link */}
        <p className="text-center text-xs uppercase tracking-widest text-gray mt-8">
          No account?{" "}
          <Link href="/cart/register" className="text-white hover:underline underline-offset-4 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
