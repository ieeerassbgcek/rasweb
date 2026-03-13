"use client";

import Image from "next/image";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { onValue, ref, DataSnapshot } from "firebase/database";
import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/firebase";

interface EventItem {
  id: string;
  title: string;
  date?: string;
  description?: string;
  link?: string;
}

export default function Home() {
  const { user, auth } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);

  const portalHref = user ? "/portal" : "/auth/login";
  const portalLabel = user
    ? "Go to Components Portal"
    : "Login to access Components Portal";
  const navPortalLabel = user ? "Portal" : "Components Portal";
  const navAuthHref = user ? "/dashboard" : "/auth/login";
  const navAuthLabel = user ? "Dashboard" : "Member Login";

  async function handleLogout() {
    await signOut(auth);
  }

  useEffect(() => {
    const eventsRef = ref(db, "events");
    const unsub = onValue(eventsRef, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: EventItem[] = Object.entries(val).map(([id, v]: any) => ({
        id,
        ...(v as Omit<EventItem, "id">),
      }));
      // newest first by whatever order they were added
      setEvents(list.reverse().slice(0, 3));
    });
    return () => unsub();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Background gradient and glowing blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#22d3ee_0,transparent_45%),radial-gradient(circle_at_bottom,#7c2d12_0,transparent_50%)] opacity-70" />
        <div className="absolute -left-40 top-40 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.9)_0,rgba(15,23,42,0.98)_55%,#020617_100%)]" />
      </div>

      {/* Top navigation bar */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3 rounded-full bg-slate-900/60 px-3 py-2 text-sm shadow-lg shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 ring-1 ring-white/10">
              <Image
                src="/logo.png"
                alt="IEEE RAS SB GCEK logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                IEEE RAS SB GCEK
              </p>
              <p className="text-[0.7rem] text-slate-300">
                Robotics & Automation Society · GCEK Kannur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
              <a
                href="#about"
                className="transition-colors hover:text-cyan-300"
              >
                About
              </a>
              <a
                href="#activities"
                className="transition-colors hover:text-cyan-300"
              >
                Activities
              </a>
              <a
                href="#discord"
                className="transition-colors hover:text-cyan-300"
              >
                Discord
              </a>
              <a
                href={portalHref}
                className="transition-colors hover:text-cyan-300"
              >
                {navPortalLabel}
              </a>
              {user && (
                <a
                  href="/profile"
                  className="transition-colors hover:text-cyan-300"
                >
                  Profile
                </a>
              )}
              <a
                href={navAuthHref}
                className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm shadow-black/30 transition hover:bg-white"
              >
                {navAuthLabel}
              </a>
            </nav>
            {user && (
              <button
                onClick={handleLogout}
                className="hidden rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700 md:inline-flex"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative z-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 md:flex-row md:items-center">
          {/* Left: main copy */}
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>Student Community • Robotics • Automation • AI</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Building the future of robotics at
              <span className="block bg-linear-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                Government College of Engineering Kannur
              </span>
            </h1>

            <p className="max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
              IEEE Robotics & Automation Society Student Branch Chapter at GCEK
              — a place for makers, coders, and innovators to learn, build and
              compete in robotics and automation. Join us for hands-on projects,
              workshops, and a supportive community.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#discord"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110"
              >
                Join Discord
              </a>
              <a
                href={portalHref}
                className="inline-flex items-center justify-center rounded-full border border-slate-500/60 bg-slate-900/40 px-6 py-2.5 text-sm font-medium text-slate-100 shadow-sm shadow-black/40 transition hover:border-cyan-300/80 hover:text-cyan-200"
              >
                {portalLabel}
              </a>
            </div>

            <p className="text-xs text-slate-400">
              Open to all GCEK students. Extra features unlock with a verified
              IEEE Membership ID.
            </p>
          </div>

          {/* Right: snapshot + Discord card */}
          <div className="flex w-full flex-col gap-4 md:max-w-md">
            {/* Snapshot card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/40 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Live Chapter Snapshot
              </p>
              <p className="mt-1 text-sm text-slate-300">
                A quick look at what&apos;s happening in IEEE RAS SB GCEK.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                  <span className="text-slate-300">Active projects</span>
                  <span className="text-base font-semibold text-cyan-300">
                    6
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                  <span className="text-slate-300">
                    Components requests today
                  </span>
                  <span className="text-base font-semibold text-sky-300">
                    12
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                  <span className="text-slate-300">
                    Members online on Discord
                  </span>
                  <span className="text-base font-semibold text-emerald-300">
                    34
                  </span>
                </div>
              </div>
              <p className="mt-3 text-[0.7rem] text-slate-500">
                These are sample stats. Soon powered by Firebase & Next.js in
                real-time.
              </p>
            </div>

            {/* Discord card */}
            <div
              id="discord"
              className="relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-linear-to-r from-indigo-950/90 via-slate-950/95 to-sky-900/90 p-[1px] shadow-[0_0_45px_rgba(79,70,229,0.4)]"
            >
              <div className="relative flex h-full flex-col gap-3 rounded-2xl bg-slate-950/90 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/50">
                    <span className="text-lg font-semibold">D</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                      Community Hub
                    </p>
                    <p className="text-sm font-medium text-slate-50">
                      IEEE RAS SB GCEK Discord
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  Get project help, updates on events, component availability,
                  and connect with peers and mentors — all in one place.
                </p>
                <div className="flex flex-wrap gap-2 text-[0.7rem] text-slate-200">
                  <span className="rounded-full bg-slate-900/80 px-2 py-1 text-slate-300">
                    #project-robots
                  </span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-1 text-slate-300">
                    #events
                  </span>
                  <span className="rounded-full bg-slate-900/80 px-2 py-1 text-slate-300">
                    #help-and-doubts
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <a
                    href="https://discord.gg/your-invite" // TODO: replace with actual invite
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-slate-50 shadow-md shadow-indigo-500/60 transition hover:bg-indigo-400"
                  >
                    Join Discord
                  </a>
                  <p className="text-[0.65rem] text-slate-400">
                    Open to all GCEK students.
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-400/30 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest events section */}
      <section
        id="events"
        className="relative z-10 border-t border-white/5 bg-slate-950/90"
      >
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                Latest Events
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                What&apos;s happening at IEEE RAS SB GCEK.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {events.length === 0 && (
              <p className="text-xs text-slate-500">
                No events announced yet. Stay tuned.
              </p>
            )}
            {events.map((ev) => (
              <article
                key={ev.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm shadow-md shadow-black/30"
              >
                <h3 className="text-sm font-semibold text-slate-50">
                  {ev.title}
                </h3>
                {ev.date && (
                  <p className="mt-1 text-[0.7rem] text-slate-400">{ev.date}</p>
                )}
                {ev.description && (
                  <p className="mt-2 text-xs text-slate-300">
                    {ev.description}
                  </p>
                )}
                {ev.link && (
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-[0.7rem] font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    View details
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
