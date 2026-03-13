"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onValue, ref, update } from "firebase/database";
import { signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

interface UserProfile {
  name: string;
  email: string;
  branch: string;
  year: string;
  admissionNo: string;
  isIeeeMember: boolean;
  ieeeId: string | null;
}

export default function ProfilePage() {
  const { user, loading, auth } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    const unsub = onValue(userRef, (snap) => {
      const val = snap.val();
      if (val) setProfile(val as UserProfile);
    });
    return () => unsub();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    try {
      await update(ref(db, `users/${user.uid}`), {
        branch: profile.branch,
        year: profile.year,
        isIeeeMember: profile.isIeeeMember,
        ieeeId: profile.isIeeeMember ? profile.ieeeId : null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-300">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <button
        onClick={handleLogout}
        className="absolute right-4 top-4 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
      >
        Logout
      </button>
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/40 backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="mt-1 text-sm text-slate-300">
          View and update your membership details.
        </p>
        <form onSubmit={handleSave} className="mt-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Name
            </label>
            <input
              value={profile.name}
              disabled
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm text-slate-400 outline-none ring-1 ring-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              value={profile.email}
              disabled
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm text-slate-400 outline-none ring-1 ring-slate-800"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Branch
              </label>
              <select
                value={profile.branch}
                onChange={(e) =>
                  setProfile((p) => (p ? { ...p, branch: e.target.value } : p))
                }
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              >
                <option value="CSE">Computer Science & Engineering</option>
                <option value="ECE">
                  Electronics & Communication Engineering
                </option>
                <option value="EEE">
                  Electrical & Electronics Engineering
                </option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Year of Study
              </label>
              <select
                value={profile.year}
                onChange={(e) =>
                  setProfile((p) => (p ? { ...p, year: e.target.value } : p))
                }
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Admission Number
            </label>
            <input
              value={profile.admissionNo}
              disabled
              className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm text-slate-400 outline-none ring-1 ring-slate-800"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              id="ieee-member"
              type="checkbox"
              checked={profile.isIeeeMember}
              onChange={(e) =>
                setProfile((p) =>
                  p ? { ...p, isIeeeMember: e.target.checked } : p
                )
              }
              className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-500"
            />
            <label htmlFor="ieee-member" className="text-xs text-slate-200">
              I am an IEEE Member
            </label>
          </div>
          {profile.isIeeeMember && (
            <div>
              <label className="block text-xs font-medium text-slate-300">
                IEEE Membership ID
              </label>
              <input
                value={profile.ieeeId ?? ""}
                onChange={(e) =>
                  setProfile((p) => (p ? { ...p, ieeeId: e.target.value } : p))
                }
                className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
