import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import pylonLogo from "../assets/images/LandingPage/pylon-logo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";
import {
  API_BASE,
  adminFetch,
  getAdminUsername,
  isAdminLoggedIn,
  logoutAdmin
} from "../lib/adminAuth";

const PAGE_SIZE = 25;
const MAROON = "#6D0C22";
const NAVY = "#0E386B";

// ==============================
// DATE HELPERS (Asia/Manila)
// ==============================
const phDate = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // YYYY-MM-DD
};

const RANGE_PRESETS = [
  { key: "today", label: "Today", range: () => [phDate(), phDate()] },
  { key: "7d", label: "7 days", range: () => [phDate(-6), phDate()] },
  { key: "30d", label: "30 days", range: () => [phDate(-29), phDate()] },
  { key: "month", label: "This month", range: () => [phDate().slice(0, 8) + "01", phDate()] },
  { key: "all", label: "All time", range: () => ["", ""] }
];

// Backend sends naive UTC like "2026-11-06 04:16:13.252000"
const parseUtc = (value) => {
  if (!value) return null;
  let s = String(value).trim().replace(" ", "T");
  s = s.replace(/(\.\d{3})\d+/, "$1");
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) s += "Z";
  const d = new Date(s);
  return isNaN(d) ? null : d;
};

const fmt = (date, opts) =>
  date ? date.toLocaleString("en-PH", { timeZone: "Asia/Manila", ...opts }) : "—";

const fmtDate = (d) => fmt(d, { month: "short", day: "2-digit", year: "numeric" });
const fmtTime = (d) => fmt(d, { hour: "numeric", minute: "2-digit", hour12: true });

const fmtDuration = (start, end) => {
  if (!start || !end) return "—";
  const mins = Math.round((end - start) / 60000);
  if (mins < 0) return "—";
  const h = Math.floor(mins / 60);
  return h ? `${h}h ${mins % 60}m` : `${mins}m`;
};

const fmtHour = (h) => {
  if (h === null || h === undefined) return "N/A";
  const label = (x) => `${x % 12 || 12}${x < 12 ? "AM" : "PM"}`;
  return `${label(h)} – ${label((h + 1) % 24)}`;
};

const fmtDay = (key) =>
  key
    ? new Date(`${key}T00:00:00`).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";

export default function AdminPanel() {
  const authed = isAdminLoggedIn();

  // Filters
  const [preset, setPreset] = useState("30d");
  const [startDate, setStartDate] = useState(phDate(-29));
  const [endDate, setEndDate] = useState(phDate());

  // Data
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [chartMode, setChartMode] = useState("day");

  // Actions
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [savingAnn, setSavingAnn] = useState(false);
  const titleInputRef = useRef(null);

  // ==============================
  // AUTH GUARD
  // ==============================
  useEffect(() => {
    if (!authed) logoutAdmin();
  }, [authed]);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Back to page 1 whenever the result set changes
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, debouncedSearch]);

  const rangeBody = useMemo(
    () => ({ start_date: startDate || null, end_date: endDate || null }),
    [startDate, endDate]
  );

  // ==============================
  // FETCH STATS (summary + chart)
  // ==============================
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // page_size 1: we only need the aggregates here
      const { data } = await adminFetch("/analytics/logs", {
        method: "POST",
        body: { ...rangeBody, page: 1, page_size: 1 }
      });
      if (data.status !== "success") throw new Error(data.message);

      setStats({
        total_logs: data.total_logs,
        unique_visitors: data.unique_visitors,
        checked_in_now: data.checked_in_now,
        peak_day: data.peak_day,
        peak_hour: data.peak_hour,
        perDay: Object.entries(data.per_day_breakdown || {}).map(([day, count]) => ({
          label: fmtDay(day).replace(/, \d{4}$/, ""),
          count
        })),
        perHour: Array.from({ length: 24 }, (_, h) => ({
          label: fmtHour(h).split(" – ")[0],
          count: Number(data.hourly_distribution?.[h] || 0)
        })).filter((_, h) => h >= 6 && h <= 22)
      });
    } catch (err) {
      if (err.message !== "Session expired") toast.error("Failed to load analytics.");
    }
    setLoadingStats(false);
  }, [rangeBody]);

  // ==============================
  // FETCH LOGS (one page)
  // ==============================
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const { data } = await adminFetch("/analytics/logs", {
        method: "POST",
        body: { ...rangeBody, page, page_size: PAGE_SIZE, search: debouncedSearch }
      });
      if (data.status !== "success") throw new Error(data.message);
      // Newest check-ins first (the API already sorts; this keeps it guaranteed)
      const rows = [...(data.logs || [])].sort(
        (a, b) => (parseUtc(b.timein) || 0) - (parseUtc(a.timein) || 0)
      );
      setLogs(rows);
      setTotalMatching(data.total_matching ?? rows.length);
    } catch (err) {
      if (err.message !== "Session expired") toast.error("Failed to load attendance logs.");
    }
    setLoadingLogs(false);
  }, [rangeBody, page, debouncedSearch]);

  useEffect(() => {
    if (authed) fetchStats();
  }, [authed, fetchStats]);

  useEffect(() => {
    if (authed) fetchLogs();
  }, [authed, fetchLogs]);

  // ==============================
  // ANNOUNCEMENTS
  // ==============================
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements/all`);
      const data = await res.json();
      if (data.status === "success") setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load announcements.");
    }
  }, []);

  useEffect(() => {
    if (authed) fetchAnnouncements();
  }, [authed, fetchAnnouncements]);

  const resetComposer = () => {
    setEditingId(null);
    setAnnTitle("");
    setAnnBody("");
  };

  const saveAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) {
      return toast.warning("Title and message are required.");
    }

    setSavingAnn(true);
    try {
      const { data } = editingId
        ? await adminFetch(`/announcements/update/${editingId}`, {
            method: "PUT",
            body: { title: annTitle, message: annBody }
          })
        : await adminFetch("/announcements/add", {
            method: "POST",
            body: { title: annTitle, message: annBody }
          });

      if (data.status === "success") {
        toast.success(editingId ? "Announcement updated." : "Announcement posted.");
        resetComposer();
        fetchAnnouncements();
      } else {
        toast.error(data.message || "Failed to save.");
      }
    } catch (err) {
      if (err.message !== "Session expired") toast.error("Server error.");
    }
    setSavingAnn(false);
  };

  const startEdit = (a) => {
    setEditingId(a._id);
    setAnnTitle(a.title);
    setAnnBody(a.message);
    titleInputRef.current?.focus();
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const { data } = await adminFetch(`/announcements/delete/${id}`, { method: "DELETE" });
      if (data.status === "success") {
        toast.success("Announcement deleted.");
        if (editingId === id) resetComposer();
        fetchAnnouncements();
      } else {
        toast.error(data.message || "Failed to delete.");
      }
    } catch (err) {
      if (err.message !== "Session expired") toast.error("Server error.");
    }
  };

  // ==============================
  // REPORTS
  // ==============================
  const sendEmailReport = async () => {
    if (!startDate || !endDate) {
      return toast.warning("Pick a date range (not All time) to email a report.");
    }
    setSending(true);
    try {
      const { data } = await adminFetch("/reports/send-range", {
        method: "POST",
        body: { start_date: startDate, end_date: endDate }
      });
      if (data.status === "success") toast.success("Attendance report emailed.");
      else toast.error(data.message || "Failed to send report.");
    } catch (err) {
      if (err.message !== "Session expired") toast.error("Server error while sending report.");
    }
    setSending(false);
  };

  const downloadCsv = async () => {
    setDownloading(true);
    try {
      const { data } = await adminFetch("/analytics/logs", {
        method: "POST",
        body: { ...rangeBody, search: debouncedSearch }
      });
      if (data.status !== "success") throw new Error(data.message);

      const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows = [
        ["Email", "Name", "Office", "Position", "Date (PH)", "Time In (PH)", "Time Out (PH)", "Duration", "Resources", "Feedback"],
        ...data.logs.map((l) => {
          const tin = parseUtc(l.timein);
          const tout = parseUtc(l.timeout);
          return [
            l.email, l.name, l.office, l.position,
            fmtDate(tin), fmtTime(tin), tout ? fmtTime(tout) : "",
            fmtDuration(tin, tout), l.resources, l.feedback
          ];
        })
      ];
      const csv = "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `ico-attendance_${startDate || "start"}_to_${endDate || phDate()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.message !== "Session expired") toast.error("Failed to download CSV.");
    }
    setDownloading(false);
  };

  // ==============================
  // FILTER HANDLERS
  // ==============================
  const applyPreset = (p) => {
    const [s, e] = p.range();
    setPreset(p.key);
    setStartDate(s);
    setEndDate(e);
  };

  const onCustomDate = (setter) => (e) => {
    setPreset("custom");
    setter(e.target.value);
  };

  if (!authed) return null;

  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  const firstRow = totalMatching === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(page * PAGE_SIZE, totalMatching);
  const chartData = chartMode === "day" ? stats?.perDay : stats?.perHour;
  const rangeLabel =
    !startDate && !endDate
      ? "All time"
      : startDate === endDate
        ? fmtDay(startDate)
        : `${fmtDay(startDate)} – ${fmtDay(endDate)}`;

  return (
    <div className="min-h-screen bg-slate-100 font-[Montserrat] text-slate-800">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* ============ HEADER (sticky) ============ */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center gap-3">
          <img src={pylonLogo} alt="DOST PUP PYLON logo" className="h-9 sm:h-11 w-auto shrink-0" />
          <div className="leading-tight min-w-0 overflow-hidden">
            <p className="font-extrabold text-sm sm:text-base whitespace-nowrap">
              <span style={{ color: MAROON }}>ICO Flow</span>{" "}
              <span style={{ color: NAVY }} className="hidden min-[400px]:inline">Admin</span>
            </p>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              Innovation Commercialization Office · Co-working attendance
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <a
              href="#announcements"
              className="lg:hidden text-xs font-semibold px-3 py-2 rounded-lg text-white whitespace-nowrap"
              style={{ background: MAROON }}
            >
              + Post
            </a>
            <span className="hidden md:inline text-xs text-slate-500 max-w-[200px] truncate">
              {getAdminUsername()}
            </span>
            <button
              onClick={() => logoutAdmin()}
              className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 whitespace-nowrap"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Date range bar */}
        <div className="border-t border-slate-100">
          <div className="max-w-[1400px] mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {RANGE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                    preset === p.key
                      ? "text-white border-transparent"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                  style={preset === p.key ? { background: NAVY } : undefined}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <input
                type="date"
                aria-label="Start date"
                className="px-2 py-1 border border-slate-300 rounded-lg"
                value={startDate}
                max={endDate || undefined}
                onChange={onCustomDate(setStartDate)}
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                aria-label="End date"
                className="px-2 py-1 border border-slate-300 rounded-lg"
                value={endDate}
                min={startDate || undefined}
                onChange={onCustomDate(setEndDate)}
              />
            </div>
            <span className="text-xs text-slate-500 ml-auto hidden md:inline">
              Showing <b className="text-slate-700">{rangeLabel}</b> · PH time
            </span>
          </div>
        </div>
      </header>

      {/* ============ BODY ============ */}
      <main className="max-w-[1400px] mx-auto p-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
        {/* ---------- LEFT: analytics + logs ---------- */}
        <div className="space-y-4 min-w-0">
          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
            <StatCard label="Check-ins" value={stats?.total_logs} loading={loadingStats} />
            <StatCard label="Unique visitors" value={stats?.unique_visitors} loading={loadingStats} />
            <StatCard
              label="Checked in now"
              value={stats?.checked_in_now}
              loading={loadingStats}
              hint="Today, not yet checked out"
            />
            <StatCard label="Busiest day" value={stats && fmtDay(stats.peak_day)} loading={loadingStats} />
            <StatCard label="Peak hour" value={stats && fmtHour(stats.peak_hour)} loading={loadingStats} />
          </div>

          {/* Chart */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Visitor traffic</h2>
              <div className="flex text-xs border border-slate-300 rounded-lg overflow-hidden">
                {[
                  ["day", "By day"],
                  ["hour", "By hour"]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setChartMode(key)}
                    className={`px-3 py-1 font-semibold ${
                      chartMode === key ? "text-white" : "bg-white text-slate-600"
                    }`}
                    style={chartMode === key ? { background: NAVY } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {loadingStats ? (
              <div className="h-[240px] rounded-lg bg-slate-100 animate-pulse" />
            ) : !chartData?.some((d) => d.count) ? (
              <p className="h-[240px] grid place-items-center text-sm text-slate-500">
                No check-ins in this range.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={8} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(v) => [v, "Check-ins"]} />
                  <Bar dataKey="count" fill={MAROON} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* Attendance logs */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-4 flex flex-wrap items-center gap-2 border-b border-slate-200">
              <h2 className="font-bold mr-auto">Attendance logs</h2>
              <input
                type="search"
                placeholder="Search name, email, office…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm px-3 py-1.5 border border-slate-300 rounded-lg w-full sm:w-64"
              />
              <button
                onClick={downloadCsv}
                disabled={downloading || totalMatching === 0}
                className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                {downloading ? "Preparing…" : "Download CSV"}
              </button>
            </div>

            {/* Fixed-height scroll area with sticky column headers */}
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Visitor</th>
                    <th className="px-4 py-2 font-semibold">Office / Position</th>
                    <th className="px-4 py-2 font-semibold">Date</th>
                    <th className="px-4 py-2 font-semibold">In</th>
                    <th className="px-4 py-2 font-semibold">Out</th>
                    <th className="px-4 py-2 font-semibold">Stay</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-100 ${loadingLogs ? "opacity-50" : ""}`}>
                  {!loadingLogs && logs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-slate-500">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                  {logs.map((log) => {
                    const tin = parseUtc(log.timein);
                    const tout = parseUtc(log.timeout);
                    return (
                      <tr key={log._id} className="hover:bg-slate-50 align-top">
                        <td className="px-4 py-2">
                          <p className="font-semibold">{log.name || "—"}</p>
                          <p className="text-xs text-slate-500 break-all">{log.email}</p>
                        </td>
                        <td className="px-4 py-2">
                          <p>{log.office || "—"}</p>
                          <p className="text-xs text-slate-500">{log.position}</p>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{fmtDate(tin)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{fmtTime(tin)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {tout ? (
                            fmtTime(tout)
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              Not out
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                          {fmtDuration(tin, tout)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                {firstRow}–{lastRow} of {totalMatching.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <PageButton disabled={page <= 1} onClick={() => setPage(1)} label="«" title="First page" />
                <PageButton disabled={page <= 1} onClick={() => setPage(page - 1)} label="‹ Prev" />
                <span className="px-2">
                  Page {page} of {totalPages}
                </span>
                <PageButton disabled={page >= totalPages} onClick={() => setPage(page + 1)} label="Next ›" />
                <PageButton disabled={page >= totalPages} onClick={() => setPage(totalPages)} label="»" title="Last page" />
              </div>
            </div>
          </section>
        </div>

        {/* ---------- RIGHT: sticky sidebar ---------- */}
        <aside className="space-y-4 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-136px)] lg:overflow-y-auto lg:pr-1">
          {/* Announcements */}
          <section
            id="announcements"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 scroll-mt-32"
          >
            <h2 className="font-bold mb-3">{editingId ? "Edit announcement" : "Post an announcement"}</h2>
            <form onSubmit={saveAnnouncement} className="space-y-2">
              <input
                ref={titleInputRef}
                type="text"
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Title (e.g. Holiday schedule)"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
              />
              <textarea
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg resize-y"
                placeholder="Message shown on the check-in page…"
                rows={3}
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
              />
              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetComposer}
                    className="flex-1 text-sm font-semibold py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingAnn}
                  className="flex-1 text-sm font-semibold py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                  style={{ background: MAROON }}
                >
                  {savingAnn ? "Saving…" : editingId ? "Save changes" : "Post"}
                </button>
              </div>
            </form>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Live on check-in page ({announcements.length})
              </p>
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-500">No announcements yet.</p>
              ) : (
                <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {announcements.map((a) => (
                    <li
                      key={a._id}
                      className={`p-3 rounded-lg border text-sm ${
                        editingId === a._id ? "border-[#0E386B] bg-blue-50/40" : "border-slate-200"
                      }`}
                    >
                      <p className="font-semibold">{a.title}</p>
                      <p className="text-slate-600 whitespace-pre-line">{a.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-slate-400">
                          {fmt(parseUtc(a.created_at), {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </span>
                        <span className="flex gap-3 text-xs font-semibold">
                          <button onClick={() => startEdit(a)} className="text-[#0E386B] hover:underline">
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAnnouncement(a._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Email report */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="font-bold mb-1">Email attendance report</h2>
            <p className="text-xs text-slate-500 mb-3">
              Sends a CSV for <b>{rangeLabel}</b> to the office report inbox.
            </p>
            <button
              onClick={sendEmailReport}
              disabled={sending || (!startDate && !endDate)}
              className="w-full py-2 text-sm text-white font-semibold rounded-lg bg-gradient-to-r from-[#6D0C22] to-[#0E386B] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending…" : "Email report"}
            </button>
          </section>

          {/* Powered by (same as the public pages) */}
          <div className="flex flex-col items-center py-2 space-y-1">
            <p className="text-[10px] text-slate-400">Powered By:</p>
            <div className="flex items-center space-x-2">
              <img src={cybernest} alt="Cybernest Solutions" className="h-12" />
              <img src={flow} alt="Flow" className="h-4" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ==============================
// SMALL COMPONENTS
// ==============================
function StatCard({ label, value, loading, hint }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200" title={hint}>
      <h3 className="text-xs text-slate-500">{label}</h3>
      {loading ? (
        <div className="h-7 mt-1 w-2/3 rounded bg-slate-100 animate-pulse" />
      ) : (
        <p className="text-xl font-bold truncate">
          {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
        </p>
      )}
    </div>
  );
}

function PageButton({ label, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-2 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}
