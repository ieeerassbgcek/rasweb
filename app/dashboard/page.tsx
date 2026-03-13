"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onValue,
  ref,
  push,
  DataSnapshot,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

interface Project {
  id: string;
  title: string;
  description: string;
  components: string;
  githubUrl?: string;
  ownerUid: string;
  ownerName?: string | null;
}

interface ComponentRequest {
  id: string;
  componentName: string;
  quantity: number;
  purpose: string;
  projectName: string;
  status: string;
  createdAt?: number;
}

interface EventItem {
  id: string;
  title: string;
  date?: string;
  description?: string;
  link?: string;
}

type TabId =
  | "overview"
  | "my-projects"
  | "my-requests"
  | "community-projects"
  | "events"
  | "request-components";

export default function DashboardPage() {
  const { user, loading, auth } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myRequests, setMyRequests] = useState<ComponentRequest[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // Add-project form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [components, setComponents] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [savingProject, setSavingProject] = useState(false);

  // Components request form (inline version of portal)
  const [reqProjectName, setReqProjectName] = useState("");
  const [reqComponentName, setReqComponentName] = useState("");
  const [reqQuantity, setReqQuantity] = useState(1);
  const [reqPurpose, setReqPurpose] = useState("");
  const [savingRequest, setSavingRequest] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  // All community projects
  useEffect(() => {
    const projectsRef = ref(db, "projects");
    const unsub = onValue(projectsRef, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: Project[] = Object.entries(val).map(([id, v]: any) => ({
        id,
        ...(v as Omit<Project, "id">),
      }));
      setProjects(list.reverse());
    });
    return () => unsub();
  }, []);

  // My projects
  useEffect(() => {
    if (!user) return;
    const projectsRef = ref(db, "projects");
    const q = query(projectsRef, orderByChild("ownerUid"), equalTo(user.uid));
    const unsub = onValue(q, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: Project[] = Object.entries(val).map(([id, v]: any) => ({
        id,
        ...(v as Omit<Project, "id">),
      }));
      setMyProjects(list.reverse());
    });
    return () => unsub();
  }, [user]);

  // My component requests
  useEffect(() => {
    if (!user) return;
    const reqRef = ref(db, "componentRequests");
    const q = query(reqRef, orderByChild("userUid"), equalTo(user.uid));
    const unsub = onValue(q, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: ComponentRequest[] = Object.entries(val).map(
        ([id, v]: any) => ({
          id,
          ...(v as Omit<ComponentRequest, "id">),
        })
      );
      setMyRequests(list.reverse());
    });
    return () => unsub();
  }, [user]);

  // Events
  useEffect(() => {
    const eventsRef = ref(db, "events");
    const unsub = onValue(eventsRef, (snap: DataSnapshot) => {
      const val = snap.val() || {};
      const list: EventItem[] = Object.entries(val).map(([id, v]: any) => ({
        id,
        ...(v as Omit<EventItem, "id">),
      }));
      setEvents(list.reverse());
    });
    return () => unsub();
  }, []);

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setSavingProject(true);
    try {
      const projectsRef = ref(db, "projects");
      await push(projectsRef, {
        title,
        description,
        components,
        githubUrl: githubUrl || null,
        ownerUid: user.uid,
        ownerName: user.displayName || user.email,
        createdAt: Date.now(),
      });
      setTitle("");
      setDescription("");
      setComponents("");
      setGithubUrl("");
      setActiveTab("my-projects");
    } finally {
      setSavingProject(false);
    }
  }

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !reqComponentName.trim()) return;
    setSavingRequest(true);
    try {
      const reqRef = ref(db, "componentRequests");
      await push(reqRef, {
        componentName: reqComponentName,
        quantity: reqQuantity,
        purpose: reqPurpose,
        projectName: reqProjectName,
        userUid: user.uid,
        userEmail: user.email,
        status: "pending",
        createdAt: Date.now(),
      });
      setReqProjectName("");
      setReqComponentName("");
      setReqQuantity(1);
      setReqPurpose("");
      setActiveTab("my-requests");
    } finally {
      setSavingRequest(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.replace("/");
  }

  const tabs: { id: TabId; label: string; description?: string }[] = [
    {
      id: "overview",
      label: "Overview",
      description: "Quick summary of your activity.",
    },
    { id: "my-projects", label: "My Projects" },
    { id: "my-requests", label: "My Requests" },
    { id: "community-projects", label: "Community Projects" },
    { id: "events", label: "Events" },
    { id: "request-components", label: "Request Components" },
  ];

  function renderMainView() {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-black/30">
              <h2 className="text-base font-semibold text-slate-50">
                Hi {user?.displayName || user?.email},
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Welcome to your IEEE RAS SB GCEK dashboard. Use the side panel
                to manage projects, request components, and stay updated on
                events.
              </p>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-xl bg-slate-900/90 px-3 py-2">
                  <p className="text-slate-400">My projects</p>
                  <p className="text-lg font-semibold text-cyan-300">
                    {myProjects.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900/90 px-3 py-2">
                  <p className="text-slate-400">My requests</p>
                  <p className="text-lg font-semibold text-sky-300">
                    {myRequests.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900/90 px-3 py-2">
                  <p className="text-slate-400">Upcoming events</p>
                  <p className="text-lg font-semibold text-emerald-300">
                    {events.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "my-projects":
        return (
          <div className="space-y-6">
            <form
              onSubmit={handleAddProject}
              className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm shadow-lg shadow-black/40 backdrop-blur-xl"
            >
              <h2 className="text-sm font-semibold text-slate-100">
                Add a Project
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Project Title
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Key Components Used
                </label>
                <textarea
                  rows={2}
                  value={components}
                  onChange={(e) => setComponents(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                  placeholder="e.g. Arduino Uno, L298N, Ultrasonic Sensor"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Project Link (GitHub / Docs)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={savingProject}
                className="mt-2 w-full rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProject ? "Saving..." : "Add Project"}
              </button>
            </form>

            <div>
              <h2 className="text-lg font-semibold">My Projects</h2>
              <p className="mt-1 text-xs text-slate-400">
                Projects you have shared with the chapter.
              </p>
              <div className="mt-3 space-y-3 text-sm">
                {myProjects.length === 0 && (
                  <p className="text-xs text-slate-500">
                    You haven&apos;t added any projects yet.
                  </p>
                )}
                {myProjects.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm shadow-md shadow-black/30"
                  >
                    <h3 className="text-base font-semibold text-slate-50">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="mt-2 text-xs text-slate-300">
                        {p.description}
                      </p>
                    )}
                    {p.components && (
                      <p className="mt-2 text-[0.7rem] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          Components:
                        </span>{" "}
                        {p.components}
                      </p>
                    )}
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-[0.7rem] font-medium text-cyan-300 hover:text-cyan-200"
                      >
                        View project
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        );

      case "my-requests":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Component Requests</h2>
            <p className="mt-1 text-xs text-slate-400">
              Track the status of your component rental requests.
            </p>
            <div className="mt-3 space-y-3 text-sm">
              {myRequests.length === 0 && (
                <p className="text-xs text-slate-500">
                  You haven&apos;t submitted any requests yet.
                </p>
              )}
              {myRequests.map((r) => (
                <article
                  key={r.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm shadow-md shadow-black/30 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-50">
                      {r.componentName}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        × {r.quantity}
                      </span>
                    </h3>
                    <p className="mt-1 text-[0.7rem] text-slate-400">
                      Project: {r.projectName}
                    </p>
                    {r.purpose && (
                      <p className="mt-1 text-xs text-slate-300">{r.purpose}</p>
                    )}
                  </div>
                  <span className="mt-2 inline-flex h-7 items-center justify-center rounded-full bg-slate-800 px-3 text-[0.7rem] capitalize text-slate-100 sm:mt-0">
                    {r.status}
                  </span>
                </article>
              ))}
            </div>
          </div>
        );

      case "community-projects":
        return (
          <div>
            <h2 className="text-lg font-semibold">Community Projects</h2>
            <p className="mt-1 text-xs text-slate-400">
              Browse projects shared by members of IEEE RAS SB GCEK.
            </p>
            <div className="mt-3 space-y-3 text-sm">
              {projects.length === 0 && (
                <p className="text-xs text-slate-500">
                  No projects yet. Be the first to add one!
                </p>
              )}
              {projects.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm shadow-md shadow-black/30"
                >
                  <h3 className="text-base font-semibold text-slate-50">
                    {p.title}
                  </h3>
                  {p.ownerName && (
                    <p className="mt-1 text-[0.7rem] text-slate-400">
                      by {p.ownerName}
                    </p>
                  )}
                  {p.description && (
                    <p className="mt-2 text-xs text-slate-300">
                      {p.description}
                    </p>
                  )}
                  {p.components && (
                    <p className="mt-2 text-[0.7rem] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        Components:
                      </span>{" "}
                      {p.components}
                    </p>
                  )}
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-[0.7rem] font-medium text-cyan-300 hover:text-cyan-200"
                    >
                      View project
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        );

      case "events":
        return (
          <div>
            <h2 className="text-lg font-semibold">Chapter Events</h2>
            <p className="mt-1 text-xs text-slate-400">
              Upcoming and recent events from IEEE RAS SB GCEK.
            </p>
            <div className="mt-3 space-y-3 text-sm">
              {events.length === 0 && (
                <p className="text-xs text-slate-500">No events yet.</p>
              )}
              {events.map((ev) => (
                <article
                  key={ev.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm shadow-md shadow-black/30"
                >
                  <h3 className="text-base font-semibold text-slate-50">
                    {ev.title}
                  </h3>
                  {ev.date && (
                    <p className="mt-1 text-[0.7rem] text-slate-400">
                      {ev.date}
                    </p>
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
                      className="mt-2 inline-flex text-[0.7rem] font-medium text-cyan-300 hover:text-cyan-200"
                    >
                      View details
                    </a>
                  )}
                </article>
              ))}
            </div>
          </div>
        );

      case "request-components":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Request Components</h2>
            <p className="mt-1 text-xs text-slate-400">
              Submit a new component request for your project.
            </p>
            <form
              onSubmit={handleSubmitRequest}
              className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm shadow-xl shadow-black/40 backdrop-blur-xl"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Project Name
                </label>
                <input
                  required
                  value={reqProjectName}
                  onChange={(e) => setReqProjectName(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Component Name
                </label>
                <input
                  required
                  value={reqComponentName}
                  onChange={(e) => setReqComponentName(e.target.value)}
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
                    value={reqQuantity}
                    onChange={(e) =>
                      setReqQuantity(Number(e.target.value) || 1)
                    }
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
                  value={reqPurpose}
                  onChange={(e) => setReqPurpose(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-950/60 px-3 py-2 text-sm outline-none ring-1 ring-slate-700 focus:ring-cyan-400"
                  placeholder="How will you use these components?"
                />
              </div>
              <button
                type="submit"
                disabled={savingRequest}
                className="mt-2 w-full rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingRequest ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <button
        onClick={handleLogout}
        className="absolute right-4 top-4 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-700"
      >
        Logout
      </button>
      <div className="mx-auto flex max-w-6xl gap-6">
        {/* Side panel */}
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 flex-shrink-0 flex-col rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-sm shadow-lg shadow-black/40 backdrop-blur-xl md:flex">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Dashboard
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {user?.displayName || user?.email}
            </p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 text-xs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-cyan-200 ring-1 ring-cyan-400/60"
                    : "text-slate-300 hover:bg-slate-900/70 hover:text-cyan-100"
                }`}
              >
                <span className="text-[0.75rem] font-semibold">
                  {tab.label}
                </span>
                {tab.description && (
                  <span className="mt-0.5 text-[0.65rem] text-slate-400">
                    {tab.description}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main view */}
        <section className="w-full rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-xl shadow-black/40 backdrop-blur-xl">
          {renderMainView()}
        </section>
      </div>
    </main>
  );
}
