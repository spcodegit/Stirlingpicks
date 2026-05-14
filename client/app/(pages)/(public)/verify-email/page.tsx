"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { authService } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, login } = useAuth();
    const code = searchParams.get("code");
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState("");
    const verifyStarted = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (!code || verifyStarted.current) return;

            verifyStarted.current = true;

            try {
                const data = await authService.verifyEmail(code);
                if (data.status === 200 || data.status === 201) {
                    setStatus('success');
                    setMessage(data.message || "Email verified successfully!");

                    // Update user state if logged in
                    const storedToken = localStorage.getItem('token');
                    const storedUser = localStorage.getItem('user');

                    if (storedToken && storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            const updatedUser = { ...parsedUser, isVerified: true };
                            login(storedToken, updatedUser);
                        } catch (e) {
                            console.error("Error updating local user state:", e);
                        }
                    }

                    // Redirect to home after 3 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || "Verification failed. The link may be expired.");
                }
            } catch (err: any) {
                console.error("Verification Error:", err);
                // If it's already verified or error, check if user is already verified
                if (user?.isVerified) {
                    setStatus('success');
                    setMessage("Your email is already verified!");
                } else {
                    setStatus('error');
                    setMessage(err.response?.data?.message || "Verification failed. Please try again.");
                }
            }
        };

        if (code) {
            verify();
        } else {
            setStatus('error');
            setMessage("Missing verification code.");
        }
    }, [code, user, login, router]);

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-500">
                {/* Header Decoration */}
                <div className="h-2 bg-[var(--bg-green-primary)] w-full"></div>

                <div className="p-8 sm:p-12 text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <Loader2 size={64} className="text-[var(--bg-green-primary)] animate-spin mb-6" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-inter tracking-tight">Verifying Email</h1>
                            <p className="text-gray-500 font-inter">Please wait while we verify your account...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                                <CheckCircle2 size={40} className="text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-inter tracking-tight">Email Verified!</h1>
                            <p className="text-gray-500 mb-8 font-inter leading-relaxed">
                                {message} Your account is now fully activated. Redirecting you to the home page...
                            </p>
                            <Link
                                href="/"
                                className="w-full h-[56px] bg-[var(--bg-navy-secondary)] hover:bg-black text-white font-inter font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                            >
                                Continue to Home
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <Link
                                    href="/"
                                    className="h-[52px] border border-gray-200 text-gray-600 font-inter font-bold rounded-xl transition-all flex items-center justify-center hover:bg-gray-50"
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/contact"
                                    className="h-[52px] bg-[var(--bg-green-primary)] text-black font-inter font-bold rounded-xl transition-all flex items-center justify-center hover:opacity-90"
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

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
                <Loader2 size={40} className="text-[var(--bg-green-primary)] animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
