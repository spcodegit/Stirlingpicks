"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck, X } from "lucide-react";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo-2.png";

export default function VerifyEmailModal() {
    const searchParams = useSearchParams();
    const { user, login, openLoginModal, closeVerifyModal } = useAuth();
    const codeFromUrl = searchParams.get("code");

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'prompt'>('loading');
    const [message, setMessage] = useState("");
    const verifyStarted = useRef(false);

    // Translate raw server messages / HTTP status codes into user-friendly strings
    const resolveErrorMessage = useCallback((raw: string, httpStatus?: number): string => {
        const lower = raw.toLowerCase();
        if (httpStatus === 400 || lower.includes("invalid") || lower.includes("bad request")) {
            return "The verification link is invalid or has already been used. Please request a new one.";
        }
        if (httpStatus === 410 || lower.includes("expired")) {
            return "This verification link has expired. Please request a new verification email.";
        }
        if (httpStatus === 404 || lower.includes("not found")) {
            return "We couldn't find an account linked to this verification code. Please sign up again.";
        }
        if (httpStatus === 429 || lower.includes("too many")) {
            return "Too many verification attempts. Please wait a moment and try again.";
        }
        if (httpStatus && httpStatus >= 500) {
            return "Our server encountered an error. Please try again in a few minutes.";
        }
        return raw || "Verification failed. Please try again or contact support.";
    }, []);

    const handleClose = useCallback(() => {
        closeVerifyModal();

        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('code')) {
                url.searchParams.delete('code');
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [closeVerifyModal]);

    const handleVerify = useCallback(async (codeToUse: string) => {
        if (!codeToUse) return;

        // Ensure the spinner is visible for at least 1 second
        const startTime = Date.now();
        const ensureMinDelay = () => new Promise<void>(resolve => {
            const remaining = 1000 - (Date.now() - startTime);
            if (remaining > 0) setTimeout(resolve, remaining); else resolve();
        });

        setStatus('loading');
        setMessage('');

        try {
            const data = await authService.verifyEmail(codeToUse);
            await ensureMinDelay();

            if (data.status === 200 || data.status === 201) {
                // Update local user state to reflect verified status
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                if (storedToken && storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        login(storedToken, { ...parsedUser, isVerified: true }, false);
                    } catch (e) {
                        console.error("Error updating local user state:", e);
                    }
                }

                // Clean ?code= from URL
                if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('code');
                    window.history.replaceState({}, '', url.toString());
                }

                setStatus('success');
                setMessage(data.message || "Email verified successfully!");
                setTimeout(() => { handleClose(); }, 2000);

            } else {
                const errorMessage = data.message;
                const raw = typeof errorMessage === 'object'
                    ? (errorMessage.user || "Verification failed.")
                    : (errorMessage || "Verification failed.");
                setStatus('error');
                setMessage(resolveErrorMessage(raw, data.status));
            }
        } catch (err: unknown) {
            await ensureMinDelay();
            console.error("Verification Error:", err);
            const errorObj = err as { response?: { status?: number; data?: { message?: string | { user?: string } } }; message?: string };
            const httpStatus = errorObj?.response?.status;
            const rawMsg = errorObj?.response?.data?.message || errorObj?.message || "";
            const finalRaw = typeof rawMsg === 'object' ? ((rawMsg as { user?: string }).user || "Server Error") : rawMsg;

            setStatus('error');
            setMessage(resolveErrorMessage(finalRaw, httpStatus));
        }
    }, [login, handleClose, resolveErrorMessage]);

    useEffect(() => {
        const triggerVerify = async () => {
            if (codeFromUrl && !verifyStarted.current) {
                verifyStarted.current = true;
                await handleVerify(codeFromUrl);
            } else if (!codeFromUrl) {
                // No code in URL — close the modal silently instead of showing the prompt
                handleClose();
            }
        };

        triggerVerify();
    }, [codeFromUrl, handleVerify]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div
                className="relative w-full max-w-[480px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div className="relative h-[56px] bg-[var(--bg-green-header)] flex items-center px-4">
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>

                    <div className="relative flex items-center gap-2.5 z-10">
                        <ShieldCheck size={18} className="text-[var(--bg-navy-secondary)]" />
                        <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide uppercase">Email Verification</span>
                    </div>

                    <button
                        onClick={handleClose}
                        className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                    >
                        <X size={26} strokeWidth={1.5} />
                    </button>

                    <div className="absolute right-[65px] top-0 bottom-0 w-[1px] bg-[var(--bg-navy-secondary)]/20 -skew-x-[25deg]"></div>
                </div>

                {/* Brand Section */}
                <div className="bg-[var(--bg-green-card)] py-3 px-8 flex items-center justify-between border-b border-[var(--border-light)]">
                    <div className="flex items-center select-none">
                        <Image
                            src={logo}
                            alt="Stirling Picks"
                            className="w-[40px] h-[40px] object-contain bg-white rounded-full"
                        />
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[var(--text-white)] font-orbitron font-bold text-[14px] uppercase tracking-wider">Verification</span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 sm:p-12 text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center py-8 gap-5">
                            <Loader2 size={72} className="text-[var(--bg-green-primary)] animate-spin" strokeWidth={2} />
                            <div className="space-y-1 text-center">
                                <p className="text-[var(--text-dark)] font-inter font-bold text-[17px]">Verifying your email…</p>
                                <p className="text-[var(--text-dark-secondary)] font-inter text-[13px]">Please wait, this only takes a second.</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-4 font-inter tracking-tight">Email Verified!</h2>
                            <div className="w-full p-4 bg-[var(--bg-green-primary)]/10 border border-[var(--bg-green-primary)]/20 rounded-xl mb-6">
                                <p className="text-[var(--bg-navy-secondary)] font-inter font-medium leading-relaxed">
                                    {message || "Your email has been verified successfully!"}
                                </p>
                            </div>
                            <p className="text-[var(--text-dark-secondary)] mb-8 font-inter text-sm leading-relaxed">
                                Your account is now fully activated. You can now start using all our features and start winning with Stirling Picks.
                            </p>
                            <button
                                onClick={user ? handleClose : () => { handleClose(); openLoginModal(); }}
                                className="w-full h-[56px] bg-[var(--bg-navy-secondary)] hover:bg-black text-white font-inter font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {user ? "Continue Browsing" : "Log In to Your Account"}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                                <XCircle size={40} className="text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-inter tracking-tight">Verification Failed</h1>
                            <p className="text-red-500/80 mb-8 font-inter leading-relaxed px-4">
                                {message}
                            </p>
                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={handleClose}
                                    className="h-[52px] w-full bg-[var(--bg-navy-secondary)] text-white font-inter font-bold rounded-xl transition-all hover:bg-black"
                                >
                                    Close
                                </button>
                                <Link
                                    href="/contact"
                                    onClick={handleClose}
                                    className="h-[52px] w-full bg-[var(--bg-green-primary)] text-black font-inter font-bold rounded-xl transition-all flex items-center justify-center hover:opacity-90"
                                >
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}
