"use client";

import React, { useState } from "react";
import { KeyRound, X, Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { authService } from "../../services/authService";
import Image from "next/image";
import logo from "@/public/images/logo-2.png";

interface ForgotPasswordProps {
    onClose: () => void;
    onBackToLogin?: () => void;
}

export default function ForgotPassword({ onClose, onBackToLogin }: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await authService.forgotPassword(email);
            if (data.status === 200 || data.status === 201) {
                setSuccess(true);
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err: any) {
            console.error("Forgot Password Error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to send reset link.";
            setError(typeof errorMessage === 'object' ? (errorMessage.user || "Server Error") : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[440px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300">
                {/* Header Bar */}
                <div className="relative h-[56px] bg-[var(--bg-green-header)] flex items-center px-4">
                    {/* Diagonal Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>

                    <div className="relative flex items-center gap-2.5 z-10">
                        <KeyRound size={18} className="text-[var(--bg-navy-secondary)]" />
                        <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide uppercase">Forgot Password</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                    >
                        <X size={26} strokeWidth={1.5} />
                    </button>

                    <div className="absolute right-[65px] top-0 bottom-0 w-[1px] bg-[var(--bg-navy-secondary)]/20 -skew-x-[25deg]"></div>
                </div>

                {/* Brand Section */}
                <div className="bg-[var(--bg-green-primary)] py-2 sm:py-3 px-6 sm:px-8 flex items-center justify-between border-b border-[var(--border-light)]">
                    <div className="flex items-center select-none">
                        <Image
                            src={logo}
                            alt="Stirling Picks"
                            className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] object-contain bg-white rounded-full"
                        />
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-9 pt-10">
                    {!success ? (
                        <>
                            <div className="mb-8">
                                <h2 className="text-[var(--text-dark)] font-inter font-bold text-xl mb-2">Reset Password</h2>
                                <p className="text-[var(--text-dark-secondary)] font-inter text-sm leading-relaxed">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray-placeholder)] group-focus-within:text-[var(--bg-yellow-primary)] transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Your Email Address"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-[52px] pl-12 pr-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[16px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-[60px] bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--bg-navy-secondary)] font-inter font-bold text-[17px] rounded-[3px] transition-all active:scale-[0.985] cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                <CheckCircle2 size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--text-dark)] mb-2 font-inter">Check your email</h3>
                            <p className="text-[var(--text-dark-secondary)] mb-8 font-inter text-sm leading-relaxed">
                                We've sent a <span className="font-bold text-[var(--text-black)]">temporary password</span> to <span className="font-bold text-[var(--text-black)]">{email}</span>. Please check your inbox and use it to log in.
                            </p>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-xs text-left">
                                <p className="font-bold mb-1">Next steps:</p>
                                <ul className="list-disc ml-4 space-y-1">
                                    <li>Copy the temporary password from your email.</li>
                                    <li>Go back to the layout and log in.</li>
                                    <li>You can then change your password from your account settings.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Back Link */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={onBackToLogin}
                            className="flex items-center gap-2 text-[var(--text-dark-secondary)] font-inter font-semibold text-[15px] hover:text-[var(--text-black)] transition-colors group cursor-pointer"
                        >
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            <span>Back to log in</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
