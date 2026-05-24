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
    return `${date.getDate().toString().padStart(2, "0")} ${months[date.getMonth()]} ${date.getFullYear()}, ${h.toString().padStart(2, "0")}:${m} ${ampm}`;
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-0 group-hover:opacity-40 transition-opacity"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    return sortDirection === "asc" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-neutral-800 sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              className="text-white"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-mono text-sm font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Kill Switch */}
            <div className="flex items-center gap-3 border border-neutral-700 px-4 py-2">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  className={
                    fundingActive ? "text-emerald-400" : "text-red-400"
                  }
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 hidden sm:inline">
                  Funding Portal
                </span>
              </div>

              <button
                id="kill-switch"
                onClick={handleKillSwitch}
                disabled={killSwitchLoading || !fundingStatusLoaded}
                title={
                  fundingActive
                    ? "Click to CLOSE the funding portal"
                    : "Click to OPEN the funding portal"
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:pointer-events-none ${
                  fundingActive
                    ? "bg-emerald-500 focus:ring-emerald-500"
                    : "bg-red-600 focus:ring-red-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                    fundingActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>

              <span
                className={`font-mono text-xs font-semibold tracking-wider ${fundingActive ? "text-emerald-400" : "text-red-400"}`}
              >
                {!fundingStatusLoaded
                  ? "..."
                  : fundingActive
                    ? "OPEN"
                    : "CLOSED"}
              </span>
            </div>

            {/* Add Button */}
            <button
              id="btn-add-contributor"
              onClick={openAddModal}
              className="btn-primary flex items-center gap-2 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>

            {/* Logout */}
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="btn-ghost py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* ── Kill Switch Banner ─────────────────────────────────────────── */}
        {fundingStatusLoaded && !fundingActive && (
          <div className="mb-6 border border-red-500/40 bg-red-500/10 px-5 py-3 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              className="text-red-400 shrink-0"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="font-mono text-xs text-red-300 uppercase tracking-wider">
              <span className="font-bold">
                Funding portal is currently CLOSED.
              </span>{" "}
              New contributions are blocked. Toggle the switch in the header to
              reopen.
            </p>
          </div>
        )}

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Contributors" value={stats.total} />
          <StatCard
            label="Total Amount"
            value={`₹${stats.totalAmount.toLocaleString("en-IN")}`}
          />
          <StatCard label="Pending" value={stats.pending} accent="amber" />
          <StatCard label="Verified" value={stats.verified} accent="emerald" />
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dark w-full sm:w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>

          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-10 w-full"
            />
          </div>

          <button
            onClick={fetchContributions}
            className="btn-ghost py-2 px-4 flex items-center justify-center gap-2 shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="border border-neutral-800 overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="bg-neutral-900 border-b border-neutral-800">
                <th className="text-left text-neutral-500 text-xs font-mono uppercase tracking-wider px-4 py-3">
                  #
                </th>
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
                    className="text-left text-neutral-500 text-xs font-mono uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-white transition-colors select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{label}</span>
                      <SortIcon field={field} />
                    </div>
                  </th>
                ))}
                <th className="text-left text-neutral-500 text-xs font-mono uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-800">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div
                          className="h-3 bg-neutral-800 animate-pulse rounded-sm"
                          style={{ width: `${60 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedContributions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-20 text-neutral-600"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                        className="text-neutral-700"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                      <p className="font-mono text-sm uppercase tracking-wider">
                        No contributions found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedContributions.map((c, index) => (
                  <tr
                    key={c._id || index}
                    style={{ animationDelay: `${index * 25}ms` }}
                    className="border-b border-neutral-800/60 hover:bg-neutral-900/50 transition-colors duration-150 animate-row-fade"
                  >
                    <td className="px-4 py-3.5 text-xs text-neutral-500 font-mono">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-neutral-400">
                      {c.email}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-mono text-white">
                      ₹{(c.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-neutral-300">
                      {c.examType || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-neutral-300 font-mono">
                      {c.passoutYear || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-neutral-500 font-mono whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Verify */}
                        {c.status === "pending" && (
                          <button
                            onClick={() => handleVerify(c._id)}
                            disabled={verifyingId === c._id}
                            className="text-xs font-mono uppercase tracking-wider px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                          >
                            {verifyingId === c._id ? (
                              <svg
                                className="animate-spin h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(c)}
                          className="text-xs font-mono uppercase tracking-wider px-2.5 py-1.5 bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-neutral-500 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="text-xs font-mono uppercase tracking-wider px-2.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
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

        {/* Row count */}
        {!loading && sortedContributions.length > 0 && (
          <p className="text-xs font-mono text-neutral-600 mt-3 uppercase tracking-wider">
            Showing {sortedContributions.length} of {contributions.length}{" "}
            record{contributions.length !== 1 ? "s" : ""}
          </p>
        )}
      </main>

      {/* ── Add Modal ──────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <ModalHeader
              title="Add Contributor"
              onClose={() => setShowAddModal(false)}
            />
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <ContributorFields
                formData={formData}
                setFormData={setFormData}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-add"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 py-3"
                >
                  {submitting ? "Adding..." : "Add Contributor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {showEditModal && editTarget && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <ModalHeader
              title="Edit Contributor"
              onClose={() => setShowEditModal(false)}
            />
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <ContributorFields
                formData={formData}
                setFormData={setFormData}
                showStatus
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-ghost flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-edit"
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 py-3"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ───────────────────────────────────────────────────── */}
      {showDeleteModal && deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-box max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              title="Confirm Deletion"
              onClose={() => setShowDeleteModal(false)}
            />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="shrink-0 bg-red-500/10 border border-red-500/30 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    className="text-red-400"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-sm text-white font-semibold mb-1">
                    Delete this record?
                  </p>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    You are about to permanently delete{" "}
                    <span className="text-white font-semibold">
                      {deleteTarget.name}
                    </span>{" "}
                    ({deleteTarget.email}). This action{" "}
                    <span className="text-red-400">cannot be undone</span>.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-ghost flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="btn-danger flex-1 py-3"
                >
                  {submitting ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  const dotColor =
    accent === "amber"
      ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
      : accent === "emerald"
        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
        : "bg-neutral-500";

  const borderTop =
    accent === "amber"
      ? "border-t-amber-500"
      : accent === "emerald"
        ? "border-t-emerald-500"
        : "border-t-neutral-600";

  return (
    <div className={`tactile-card bg-grid-pattern border-t-2 ${borderTop}`}>
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <div
          className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 animate-pulse-glow`}
        />
        <p className="font-mono text-xs uppercase tracking-wider text-neutral-400 truncate">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold font-mono text-white relative z-10 tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shrink-0 shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
        Verified
      </span>
    );
  return (
    <span className="inline-flex items-center bg-amber-950/40 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 shrink-0 animate-pulse-glow shadow-[0_0_4px_rgba(251,191,36,0.4)]" />
      Pending
    </span>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
      <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
        {title}
      </h2>
      <button
        onClick={onClose}
        className="text-neutral-500 hover:text-white transition-colors p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="square"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

function ContributorFields({ formData, setFormData, showStatus = false }) {
  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
            Full Name *
          </label>
          <input
            required
            value={formData.name}
            onChange={set("name")}
            placeholder="John Doe"
            className="input-dark"
          />
        </div>
        <div className="col-span-2">
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
            Email *
          </label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={set("email")}
            placeholder="john@example.com"
            className="input-dark"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
            Amount (₹) *
          </label>
          <input
            required
            type="number"
            min="1"
            value={formData.amount}
            onChange={set("amount")}
            placeholder="1000"
            className="input-dark"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
            Exam Type *
          </label>
          <select
            required
            value={formData.examType}
            onChange={set("examType")}
            className="select-dark"
          >
            <option value="HS">HS</option>
            <option value="Madhyamik">Madhyamik</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
            Passout Year *
          </label>
          <select
            required
            value={formData.passoutYear}
            onChange={set("passoutYear")}
            className="select-dark"
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
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={set("status")}
              className="select-dark"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;
