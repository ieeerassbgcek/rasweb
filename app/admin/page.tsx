"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onValue, ref, update, DataSnapshot } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

interface ComponentRequest {
  id: string;
  componentName: string;
  quantity: number;
  purpose: string;
  projectName: string;
  userUid: string;
  userEmail: string | null;
  status: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ComponentRequest[]>([]);

  useEffect(() => {
    // Simple guard – later you can add proper admin role checks
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const reqRef = ref(db, "componentRequests");
    const unsub = onValue(reqRef, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: ComponentRequest[] = Object.entries(val).map(
        ([id, v]: any) => ({
          id,
          ...(v as Omit<ComponentRequest, "id">),
        })
      );
      setRequests(list.reverse());
    });
    return () => unsub();
  }, []);

  async function handleUpdateStatus(id: string, status: string) {
    await update(ref(db, `componentRequests/${id}`), { status });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Admin – Component Requests</h1>
        <p className="mt-1 text-sm text-slate-300">
          Review and manage component rental requests from members.
        </p>
        <div className="mt-6 space-y-3 text-sm">
          {requests.length === 0 && (
            <p className="text-xs text-slate-500">No requests yet.</p>
          )}
          {requests.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-md shadow-black/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-50">
                    {r.componentName}
                    <span className="text-xs font-normal text-slate-400">
                      × {r.quantity}
                    </span>
                  </h2>
                  <p className="text-[0.7rem] text-slate-400">
                    Project: {r.projectName}
                  </p>
                  <p className="text-[0.7rem] text-slate-400">
                    By: {r.userEmail}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[0.7rem] capitalize text-slate-200">
                  {r.status}
                </span>
              </div>
              {r.purpose && (
                <p className="mt-2 text-xs text-slate-300">{r.purpose}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem]">
                <button
                  onClick={() => handleUpdateStatus(r.id, "approved")}
                  className="rounded-full bg-emerald-500 px-3 py-1 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(r.id, "issued")}
                  className="rounded-full bg-sky-500 px-3 py-1 font-semibold text-slate-950 hover:bg-sky-400"
                >
                  Mark Issued
                </button>
                <button
                  onClick={() => handleUpdateStatus(r.id, "returned")}
                  className="rounded-full bg-indigo-500 px-3 py-1 font-semibold text-slate-950 hover:bg-indigo-400"
                >
                  Mark Returned
                </button>
                <button
                  onClick={() => handleUpdateStatus(r.id, "rejected")}
                  className="rounded-full bg-red-500 px-3 py-1 font-semibold text-slate-50 hover:bg-red-400"
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
