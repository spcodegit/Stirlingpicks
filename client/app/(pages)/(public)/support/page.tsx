"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    Filter,
    ChevronDown,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Ban,
    Plus,
    X,
    Send,
    MessageSquare,
} from "lucide-react";
import { supportService, SupportItem } from "@/app/services";
import RowActionMenu from "@/app/components/transactions/RowActionMenu";

const STATUS_OPTIONS = ["placed", "pending", "complete", "rejected"] as const;

const formatDateTime = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return { date: "-", time: "" };
    return {
        date: `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`,
        time: `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`,
    };
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case "complete":
            return {
                bg: "bg-[var(--bg-green-primary)]/10",
                text: "text-[var(--bg-green-primary)]",
                icon: <CheckCircle2 size={12} />,
            };
        case "pending":
        case "placed":
            return {
                bg: "bg-[var(--bg-yellow-primary)]/10",
                text: "text-[var(--bg-yellow-primary)]",
                icon: <Clock size={12} />,
            };
        case "rejected":
            return {
                bg: "bg-red-500/10",
                text: "text-red-400",
                icon: <XCircle size={12} />,
            };
        default:
            return {
                bg: "bg-gray-500/10",
                text: "text-gray-400",
                icon: <Clock size={12} />,
            };
    }
};

export default function SupportPage() {
    const [supports, setSupports] = useState<SupportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedSupport, setSelectedSupport] = useState<SupportItem | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const LIMIT = 20;

    const fetchSupports = async (currentPage: number) => {
        setLoading(true);
        setError("");
        try {
            const response = await supportService.getAll(currentPage, LIMIT);
            const result = response?.data;
            setSupports(result?.data || []);
            setTotal(result?.pagination?.total || 0);
            setTotalPages(result?.pagination?.totalPages || 1);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === "object" ? msg.user || "Failed to load support history." : msg || "Failed to load support history.";
            setError(errorText);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupports(page);
    }, [page]);

    const handleSubmit = async () => {
        if (!message.trim()) {
            setFeedback({ type: "error", text: "Please enter a message before submitting." });
            setTimeout(() => setFeedback(null), 4000);
            return;
        }

        setSubmitting(true);
        setFeedback(null);

        try {
            const response = await supportService.create({ message: message.trim() });
            if (response?.status === 200 || response?.status === 201) {
                setFeedback({ type: "success", text: response?.message || "Support request created. Our team will contact you shortly." });
                setMessage("");
                await fetchSupports(1);
                setPage(1);
                setTimeout(() => {
                    setShowCreateModal(false);
                    setFeedback(null);
                }, 1200);
            } else {
                const msg = response?.message;
                const errorText = typeof msg === "object" ? ((msg as { user?: string }).user || "Failed to submit request") : (msg || "Failed to submit request");
                setFeedback({ type: "error", text: errorText });
            }
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { message?: string | { user?: string } } } };
            const msg = apiErr?.response?.data?.message;
            const errorText = typeof msg === "object" ? (msg.user || "Failed to submit request. Please try again.") : (msg || "Failed to submit request. Please try again.");
            setFeedback({ type: "error", text: errorText });
        } finally {
            setSubmitting(false);
            setTimeout(() => setFeedback(null), 5000);
        }
    };

    const filteredSupports = supports.filter((item) => {
        const matchesSearch =
            item._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewSupportById = async (id: string) => {
        try {
            setDetailsLoading(true);
            const response = await supportService.getById(id);
            const support = response?.data;
            if (!support) return;
            setSelectedSupport(support);
            setIsDetailsModalOpen(true);
        } catch {
            // keep history visible even if details request fails
        } finally {
            setDetailsLoading(false);
        }
    };

    return (
        <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">

            <div className="p-4 md:p-6 pb-0 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-orbitron font-bold text-white uppercase tracking-wider mb-1">
                            Support <span className="text-[var(--bg-yellow-primary)]">History</span>
                        </h1>
                        <p className="text-[var(--text-muted)] font-inter text-[12px]">
                            See your previous support messages and current request status.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(true);
                                setFeedback(null);
                            }}
                            className="flex items-center gap-2 bg-[var(--bg-green-primary)] hover:bg-[var(--bg-green-primary)]/90 text-[var(--bg-navy-secondary)] px-4 py-2 rounded-sm border border-[var(--bg-green-primary)] transition-all text-xs font-bold"
                        >
                            <Plus size={14} />
                            <span>New Message</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID or message"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm py-3 pl-10 pr-4 text-white font-inter text-xs appearance-none focus:outline-none focus:border-[var(--bg-yellow-primary)] transition-all cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-4 md:px-6 pb-6">
                <div className="h-full flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm overflow-hidden">
                    <div className="flex-1 overflow-auto no-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                                    <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Date</th>
                                    <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">ID</th>
                                    <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Message</th>
                                    <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)]">Status</th>
                                    <th className="py-4 px-4 font-orbitron text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-primary)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-primary)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] font-inter text-sm">
                                                <Loader2 size={16} className="animate-spin" />
                                                Loading support history...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-red-400 font-inter text-sm">{error}</p>
                                        </td>
                                    </tr>
                                ) : filteredSupports.length > 0 ? (
                                    filteredSupports.map((item) => {
                                        const { date, time } = formatDateTime(item.createdAt);
                                        const statusStyle = getStatusStyles(item.status);
                                        return (
                                            <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <div className="text-white font-inter text-[12px] font-medium">{date}</div>
                                                    <div className="text-[var(--text-muted)] font-inter text-[10px]">{time}</div>
                                                </td>
                                                <td className="py-4 px-4 font-inter text-[12px] text-white font-semibold">
                                                    <span className="font-mono text-[11px]">{item._id.slice(0, 8)}...{item._id.slice(-4)}</span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2 max-w-[380px]">
                                                        <div className="w-6 h-6 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center flex-shrink-0">
                                                            <MessageSquare className="text-[var(--bg-yellow-primary)]" size={14} />
                                                        </div>
                                                        <span className="text-white font-inter text-[12px] leading-5" title={item.message}>
                                                            {item.message.length > 110 ? `${item.message.slice(0, 110)}...` : item.message}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-black/5 ${statusStyle.bg} ${statusStyle.text} font-inter text-[10px] font-bold uppercase tracking-wider`}>
                                                        {statusStyle.icon}
                                                        {item.status}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <RowActionMenu onDetails={() => handleViewSupportById(item._id)} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Ban size={24} className="text-[var(--text-muted)] opacity-30" />
                                                <p className="text-[var(--text-muted)] font-inter text-sm opacity-50 uppercase tracking-widest font-bold">No Records Found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="py-3 px-4 border-t border-[var(--border-primary)] flex items-center justify-between text-[11px] bg-[var(--bg-secondary)] flex-shrink-0">
                        <span className="text-[var(--text-muted)] font-inter uppercase tracking-tighter">Total Results: {total}</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1 || loading}
                                className="px-2 py-1 rounded-sm border border-[var(--border-primary)] text-white hover:bg-white/5 disabled:opacity-30"
                            >
                                Prev
                            </button>
                            <button className="px-2.5 py-1 rounded-sm bg-[var(--bg-yellow-primary)] text-[var(--bg-navy-secondary)] font-bold">
                                {page}
                            </button>
                            <button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages || loading}
                                className="px-2 py-1 rounded-sm border border-[var(--border-primary)] text-white hover:bg-white/5 disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isDetailsModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsDetailsModalOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-[460px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300">
                        <div className="relative h-[56px] bg-[var(--bg-green-header)] flex items-center px-4">
                            <div className="relative flex items-center gap-2.5 z-10">
                                <MessageSquare size={18} className="text-[var(--bg-navy-secondary)]" />
                                <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide uppercase">
                                    Support Details
                                </span>
                            </div>

                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                                type="button"
                            >
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="p-6 space-y-3 bg-[var(--bg-white)] max-h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
                            {detailsLoading ? (
                                <div className="flex items-center justify-center gap-2 text-[var(--text-dark-secondary)] py-8">
                                    <Loader2 size={16} className="animate-spin" />
                                    Loading details...
                                </div>
                            ) : selectedSupport ? (
                                <>
                                    <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Request ID</p>
                                        <p className="text-[13px] font-bold text-[var(--text-dark)] break-all">{selectedSupport._id}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Created At</p>
                                            <p className="text-[12px] font-semibold text-[var(--text-dark)]">
                                                {formatDateTime(selectedSupport.createdAt).date} {formatDateTime(selectedSupport.createdAt).time}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Status</p>
                                            <p className="text-[12px] font-semibold text-[var(--text-dark)] uppercase">{selectedSupport.status}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-100 rounded p-3">
                                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-dark-secondary)]">Message</p>
                                        <p className="text-[12px] text-[var(--text-dark)] leading-relaxed whitespace-pre-wrap">{selectedSupport.message}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-[var(--text-dark-secondary)] py-8 text-sm">No support details found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowCreateModal(false);
                            setFeedback(null);
                        }}
                    />
                    <div className="relative w-full max-w-xl bg-[var(--bg-secondary)] rounded-[8px] border border-[var(--border-primary)] shadow-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-[var(--border-primary)] flex items-start justify-between gap-3">
                            <div>
                                <h3 className="font-orbitron text-[var(--text-primary)] text-[15px] font-bold uppercase tracking-[0.8px]">
                                    Create Support Message
                                </h3>
                                <p className="font-inter text-[var(--text-secondary)] text-[11px] mt-1">
                                    Tell us what happened and we will respond as quickly as possible.
                                </p>
                            </div>
                            <button
                                className="w-8 h-8 rounded-[6px] border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-white/5 flex items-center justify-center"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setFeedback(null);
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[11px] font-inter">
                                <MessageSquare size={14} />
                                You can have up to 3 active requests with placed or pending status.
                            </div>

                            <div>
                                <label className="block font-inter text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                                    Message
                                </label>
                                <textarea
                                    rows={7}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter a detailed description of your issue."
                                    className="w-full resize-none bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[6px] px-3 py-2.5 text-[12px] text-[var(--text-primary)] font-inter focus:outline-none focus:border-[var(--bg-green-accent)]"
                                />
                            </div>

                            {feedback && (
                                <div
                                    className={`rounded-[6px] px-3 py-2 text-[11px] font-inter flex items-center gap-2 ${
                                        feedback.type === "success"
                                            ? "border border-[var(--bg-green-accent)]/30 bg-[var(--bg-green-accent)]/10 text-[var(--text-primary)]"
                                            : "border border-red-500/30 bg-red-500/10 text-red-400"
                                    }`}
                                >
                                    {feedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    {feedback.text}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    className="px-3.5 py-2 rounded-[6px] border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[11px] font-orbitron uppercase tracking-wider hover:bg-white/5"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFeedback(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 bg-[var(--bg-green-accent)] text-[var(--text-black)] font-orbitron text-[11px] uppercase tracking-wider px-3.5 py-2 rounded-[6px] border border-black/10 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    {submitting ? "Sending..." : "Send Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
