"use client";

import { FormEvent, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const { auth, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [isIeeeMember, setIsIeeeMember] = useState(false);
  const [ieeeId, setIeeeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace("/dashboard");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      // Save user profile in Realtime Database
      await set(ref(db, `users/${cred.user.uid}`), {
        name,
        email,
        branch,
        year,
        admissionNo,
        isIeeeMember,
        ieeeId: isIeeeMember ? ieeeId : null,
        createdAt: Date.now(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/85 p-7 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Member Account
        </h1>
        <p className="mt-1.5 text-sm text-slate-300">
          Sign up to access the Components Portal, projects dashboard, and
          member features.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Branch
            </label>
            <select
              required
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
            >
              <option value="" disabled>
                Select your branch
              </option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="ECE">
                Electronics & Communication Engineering
              </option>
              <option value="EEE">Electrical & Electronics Engineering</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Year of Study
              </label>
              <select
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              >
                <option value="" disabled>
                  Select year
                </option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Admission Number
              </label>
              <input
                type="text"
                required
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              id="ieee-member"
              type="checkbox"
              checked={isIeeeMember}
              onChange={(e) => setIsIeeeMember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-500"
            />
            <label htmlFor="ieee-member" className="text-xs text-slate-200">
              I am an IEEE Member
            </label>
          </div>
          {isIeeeMember && (
            <div>
              <label className="block text-xs font-medium text-slate-300">
                IEEE Membership ID
              </label>
              <input
                type="text"
                required
                value={ieeeId}
                onChange={(e) => setIeeeId(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              />
              <p className="mt-1 text-[0.7rem] text-slate-400">
                Your ID will be used to unlock IEEE-member-only benefits.
              </p>
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-[0.7rem] text-slate-400">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
