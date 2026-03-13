"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { push, ref } from "firebase/database";
import { signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export default function PortalPage() {
  const { user, loading, auth } = useAuth();
  const router = useRouter();
  const [componentName, setComponentName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState("");
  const [projectName, setProjectName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const reqRef = ref(db, "componentRequests");
      await push(reqRef, {
        componentName,
        quantity,
        purpose,
        projectName,
        userUid: user.uid,
        userEmail: user.email,
        status: "pending",
        createdAt: Date.now(),
      });
      setComponentName("");
      setQuantity(1);
      setPurpose("");
      setProjectName("");
      alert("Request submitted");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <button
        onClick={handleLogout}
        className="absolute right-4 top-4 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
      >
        Logout
      </button>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              Components Request Portal
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Request components for your IEEE RAS SB GCEK projects.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/40 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Project Name
              </label>
              <input
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Component Name
              </label>
              <input
                required
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Purpose / Description
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                placeholder="How will you use these components?"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
