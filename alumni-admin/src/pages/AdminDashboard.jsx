import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getContributions,
  verifyContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getFundingStatus,
  setFundingStatus,
} from "../services/adminApi";

// ─── Constants ────────────────────────────────────────────────────────────────
const YEAR_START = 1977;
const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - YEAR_START + 1 },
  (_, i) => YEAR_START + i,
);

const EMPTY_FORM = {
  name: "",
  email: "",
  amount: "",
  examType: "HS",
  passoutYear: "",
  status: "pending",
};

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();

  // Data
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    pending: 0,
    verified: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & sorting
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Action states
  const [verifyingId, setVerifyingId] = useState(null);

  // Kill switch
  const [fundingActive, setFundingActive] = useState(true);
  const [killSwitchLoading, setKillSwitchLoading] = useState(false);
  const [fundingStatusLoaded, setFundingStatusLoaded] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ─── Auth Guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) navigate("/");
  }, [navigate]);

  // ─── Debounce Search ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ─── Fetch Contributions ─────────────────────────────────────────────────
  const fetchContributions = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (debouncedSearch) filters.search = debouncedSearch;
      const data = await getContributions(filters);
      setContributions(data.contributions || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("adminToken");
        navigate("/");
        return;
      }
      toast.error("Failed to fetch contributions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, navigate]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  // ─── Fetch Funding Status ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFundingStatus();
        setFundingActive(data.fundingActive);
      } catch {
        // silent — kill switch defaults to active
      } finally {
        setFundingStatusLoaded(true);
      }
    };
    load();
  }, []);

  // ─── Kill Switch Toggle ───────────────────────────────────────────────────
  const handleKillSwitch = async () => {
    const next = !fundingActive;
    setKillSwitchLoading(true);
    try {
      await setFundingStatus(next);
      setFundingActive(next);
      toast.success(
        next ? "✅ Funding portal opened" : "🔒 Funding portal closed",
      );
    } catch {
      toast.error("Failed to update funding status");
    } finally {
      setKillSwitchLoading(false);
    }
  };

  // ─── Verify ──────────────────────────────────────────────────────────────
  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await verifyContribution(id);
      toast.success("Contribution verified");
      fetchContributions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  // ─── Add Modal ────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setShowAddModal(true);
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createContribution({
        ...formData,
        amount: Number(formData.amount),
        passoutYear: Number(formData.passoutYear),
      });
      toast.success("Contributor added successfully");
      setShowAddModal(false);
      fetchContributions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add contributor");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Edit Modal ───────────────────────────────────────────────────────────
  const openEditModal = (c) => {
    setEditTarget(c);
    setFormData({
      name: c.name,
      email: c.email,
      amount: String(c.amount),
      examType: c.examType,
      passoutYear: String(c.passoutYear),
      status: c.status,
    });
    setShowEditModal(true);
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateContribution(editTarget._id, {
        ...formData,
        amount: Number(formData.amount),
        passoutYear: Number(formData.passoutYear),
      });
      toast.success("Contributor updated successfully");
      setShowEditModal(false);
      fetchContributions();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update contributor",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete Modal ─────────────────────────────────────────────────────────
  const openDeleteModal = (c) => {
    setDeleteTarget(c);
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteContribution(deleteTarget._id);
      toast.success("Contributor deleted");
      setShowDeleteModal(false);
      fetchContributions();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete contributor",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    navigate("/");
  };

  // ─── Sorting ──────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedContributions = [...contributions].sort((a, b) => {
    let vA = a[sortField] ?? "";
    let vB = b[sortField] ?? "";
    if (typeof vA === "string" && typeof vB === "string")
      return sortDirection === "asc"
        ? vA.localeCompare(vB)
        : vB.localeCompare(vA);
    return sortDirection === "asc" ? (vA < vB ? -1 : 1) : vA > vB ? -1 : 1;
  });

  // ─── Format Date ─────────────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let h = date.getHours(),
      m = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-0 group-hover:opacity-50 transition-opacity ml-1"
        >
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      );
    return sortDirection === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="ml-1 text-zinc-50"
      >
        <path d="m7 15 5 5 5-5" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="ml-1 text-zinc-50"
      >
        <path d="m7 9 5-5 5 5" />
      </svg>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-zinc-50 font-sans selection:bg-zinc-800">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800 sticky top-0 z-30 bg-black/80 backdrop-blur-md">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-50 text-black p-1 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-sm">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Kill Switch */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-400 hidden sm:inline">
                Funding Portal
              </span>
              <button
                id="kill-switch"
                onClick={handleKillSwitch}
                disabled={killSwitchLoading || !fundingStatusLoaded}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none ${
                  fundingActive ? "bg-zinc-50" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-black shadow-sm transition-transform duration-200 ${
                    fundingActive ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${fundingActive ? "text-emerald-400" : "text-zinc-500"}`}
              >
                {!fundingStatusLoaded
                  ? "..."
                  : fundingActive
                    ? "Active"
                    : "Closed"}
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* Add Button */}
            <button
              onClick={openAddModal}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-black shadow transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Contribution
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-900 hover:text-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
        {/* ── Kill Switch Banner ─────────────────────────────────────────── */}
        {fundingStatusLoaded && !fundingActive && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 mt-0.5 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="text-sm">
              <span className="font-semibold text-red-500">
                Funding portal is currently closed.
              </span>{" "}
              <span className="text-red-200/70">
                New contributions are blocked. Toggle the switch in the header
                to reopen.
              </span>
            </div>
          </div>
        )}

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Contributors" value={stats.total} />
          <StatCard
            label="Total Amount"
            value={`₹${stats.totalAmount.toLocaleString("en-IN")}`}
          />
          <StatCard label="Pending Verifications" value={stats.pending} />
          <StatCard label="Verified Contributions" value={stats.verified} />
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full sm:w-72">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2.5 top-2.5 text-zinc-500"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Filter by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-black px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-[180px] items-center justify-between rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm shadow-sm ring-offset-black placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <button
            onClick={fetchContributions}
            className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-black px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-900 hover:text-zinc-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="rounded-md border border-zinc-800 bg-black overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b [&_tr]:border-zinc-800">
                <tr className="border-b transition-colors hover:bg-zinc-900/50">
                  {[
                    ["Name", "name"],
                    ["Email", "email"],
                    ["Amount", "amount"],
                    ["Exam", "examType"],
                    ["Year", "passoutYear"],
                    ["Status", "status"],
                    ["Date", "createdAt"],
                  ].map(([label, field]) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="h-10 px-4 text-left align-middle font-medium text-zinc-400 cursor-pointer hover:text-zinc-50 transition-colors select-none group"
                    >
                      <div className="flex items-center">
                        {label}
                        <SortIcon field={field} />
                      </div>
                    </th>
                  ))}
                  <th className="h-10 px-4 text-right align-middle font-medium text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-zinc-800">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="p-4 align-middle">
                          <div
                            className="h-4 bg-zinc-800/50 animate-pulse rounded"
                            style={{ width: `${40 + Math.random() * 40}%` }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : sortedContributions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center align-middle text-sm text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-zinc-600"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="m9 16 3-3 3 3" />
                        </svg>
                        <p>No results found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedContributions.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-zinc-800 transition-colors hover:bg-zinc-900/50"
                    >
                      <td className="p-4 align-middle font-medium text-zinc-50">
                        {c.name}
                      </td>
                      <td className="p-4 align-middle text-zinc-400">
                        {c.email}
                      </td>
                      <td className="p-4 align-middle">
                        ₹{(c.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 align-middle text-zinc-400">
                        {c.examType || "—"}
                      </td>
                      <td className="p-4 align-middle text-zinc-400">
                        {c.passoutYear || "—"}
                      </td>
                      <td className="p-4 align-middle">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="p-4 align-middle text-zinc-400 whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === "pending" && (
                            <button
                              onClick={() => handleVerify(c._id)}
                              disabled={verifyingId === c._id}
                              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 bg-emerald-950/30 text-emerald-500 hover:bg-emerald-900/50 h-8 px-3"
                            >
                              {verifyingId === c._id
                                ? "Verifying..."
                                : "Verify"}
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(c)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 h-8 px-3 text-zinc-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(c)}
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 hover:bg-red-950/50 text-red-500 hover:text-red-400 h-8 px-3"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row count */}
        {!loading && sortedContributions.length > 0 && (
          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-zinc-500">
              Showing{" "}
              <span className="font-medium text-zinc-50">
                {sortedContributions.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-zinc-50">
                {contributions.length}
              </span>{" "}
              entries
            </p>
          </div>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {/* Add Modal */}
      {showAddModal && (
        <ModalOverlay onClose={() => setShowAddModal(false)}>
          <ModalBox
            title="Add Contributor"
            onClose={() => setShowAddModal(false)}
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <ContributorFields
                formData={formData}
                setFormData={setFormData}
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-2 sm:mt-0 inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-black shadow transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Contributor"}
                </button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Edit Modal */}
      {showEditModal && editTarget && (
        <ModalOverlay onClose={() => setShowEditModal(false)}>
          <ModalBox
            title="Edit Contributor"
            onClose={() => setShowEditModal(false)}
          >
            <form onSubmit={handleEdit} className="space-y-4">
              <ContributorFields
                formData={formData}
                setFormData={setFormData}
                showStatus
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mt-2 sm:mt-0 inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-black shadow transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteTarget && (
        <ModalOverlay onClose={() => setShowDeleteModal(false)}>
          <ModalBox
            title="Are you absolutely sure?"
            onClose={() => setShowDeleteModal(false)}
          >
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-medium text-zinc-50">
                  {deleteTarget.name}
                </span>
                's contribution record from the servers.
              </p>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-2 sm:mt-0 inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-zinc-50 shadow-sm transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-red-900/80 px-4 py-2 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-red-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting ? "Deleting..." : "Continue"}
                </button>
              </div>
            </div>
          </ModalBox>
        </ModalOverlay>
      )}
    </div>
  );
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-black text-zinc-50 shadow-sm p-6">
      <h3 className="tracking-tight text-sm font-medium text-zinc-400 mb-2">
        {label}
      </h3>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "verified")
    return (
      <div className="inline-flex items-center rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 bg-emerald-950/20 text-emerald-500">
        Verified
      </div>
    );
  return (
    <div className="inline-flex items-center rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 bg-amber-950/20 text-amber-500">
      Pending
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {children}
    </div>
  );
}

function ModalBox({ title, children, onClose }) {
  return (
    <div
      className="w-full max-w-lg rounded-xl border border-zinc-800 bg-black p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-zinc-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-black transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function ContributorFields({ formData, setFormData, showStatus = false }) {
  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
          Full Name
        </label>
        <input
          required
          value={formData.name}
          onChange={set("name")}
          placeholder="John Doe"
          className="flex h-9 w-full rounded-md border border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
          Email
        </label>
        <input
          required
          type="email"
          value={formData.email}
          onChange={set("email")}
          placeholder="m@example.com"
          className="flex h-9 w-full rounded-md border border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
            Amount (₹)
          </label>
          <input
            required
            type="number"
            min="1"
            value={formData.amount}
            onChange={set("amount")}
            placeholder="1000"
            className="flex h-9 w-full rounded-md border border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
            Exam Type
          </label>
          <select
            required
            value={formData.examType}
            onChange={set("examType")}
            className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm shadow-sm ring-offset-black placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="HS">HS</option>
            <option value="Madhyamik">Madhyamik</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
            Passout Year
          </label>
          <select
            required
            value={formData.passoutYear}
            onChange={set("passoutYear")}
            className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm shadow-sm ring-offset-black placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Select Year
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {showStatus && (
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
              Status
            </label>
            <select
              value={formData.status}
              onChange={set("status")}
              className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm shadow-sm ring-offset-black placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
