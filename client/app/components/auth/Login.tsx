"use client";
import React, { useState } from "react";
import { User, X, Eye, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { useRouter } from "next/navigation";
import ForgotPassword from "./ForgotPassword";
import Image from "next/image";
import logo from "@/public/images/logo-2.png";

export default function Login() {
    const { login, closeLoginModal, openSignupModal } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [saveUsername, setSaveUsername] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [view, setView] = useState<'login' | 'forgot'>('login');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await authService.login({
                email,
                password,
            });
            if (data.status === 200 || data.status === 201) {
                const { user, token } = data.data;
                const walletS = Number(user.walletS) || 0;
                const userData = {
                    ...user,
                    id: user._id || user.id,
                    walletS,
                    balance: walletS,
                    isVerified: user.isVerified || false
                };

                login(token, userData);
                router.push("/");
            } else {
                const errorMessage = data.message;
                setError(typeof errorMessage === 'object' ? (errorMessage.user || "Server Error") : (errorMessage || "Login failed. Please check your credentials."));
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Login failed. Please check your connection.";
            setError(typeof errorMessage === 'object' ? (errorMessage.user || errorMessage.system || "Server Error") : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (view === 'forgot') {
        return <ForgotPassword onClose={closeLoginModal} onBackToLogin={() => setView('login')} />;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeLoginModal}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[440px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300">
                {/* Header Bar */}
                <div className="relative h-[50px] bg-[var(--bg-green-header)] flex items-center px-4">
                    {/* Diagonal Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>

                    <div className="relative flex items-center gap-2.5 z-10 transition-colors group">
                        <User size={18} className="text-[var(--bg-navy-secondary)]" />
                        <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide">Login</span>
                    </div>

                    <button
                        onClick={closeLoginModal}
                        className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                    >
                        <X size={26} strokeWidth={1.5} />
                    </button>

                    {/* Diagonal decorative line on header right side */}
                    <div className="absolute right-[65px] top-0 bottom-0 w-[1px] bg-[var(--bg-navy-secondary)]/20 -skew-x-[25deg]"></div>
                </div>

                {/* Brand & Sign Up Section */}
                <div className="bg-[var(--bg-green-primary)] py-2 sm:py-3 px-6 sm:px-8 flex items-center justify-between border-b border-[var(--border-light)]">
                    <div className="flex items-center select-none">
                        <Image
                            src={logo}
                            alt="Stirling Picks"
                            className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] object-contain bg-white rounded-full"
                        />
                    </div>

                    <div className="text-right">
                        <p className="text-[var(--text-white)] font-inter text-[13px] mb-0.5">No account yet?</p>
                        <button onClick={openSignupModal} className="text-[var(--text-yellow)] font-inter font-bold text-[14px] hover:text-[var(--text-yellow-hover)] transition-colors tracking-tight cursor-pointer">
                            Join now!
                        </button>
                    </div>
                </div>

                {/* Login Form Body */}
                <div className="p-6 sm:p-9 pt-8 sm:pt-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            {/* Email Field */}
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-[52px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[16px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[52px] px-4 pr-12 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[16px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dark-secondary)] hover:text-[var(--text-black)] transition-colors cursor-pointer"
                                >
                                    <Eye size={20} className={showPassword ? "text-[var(--bg-yellow-primary)]" : ""} />
                                </button>
                            </div>
                        </div>

                        {/* Toggle Username Storage */}
                        <button
                            type="button"
                            onClick={() => setSaveUsername(!saveUsername)}
                            className="flex items-center gap-3 w-fit group cursor-pointer"
                        >
                            <div
                                className={`w-5 h-5 rounded-[2px] border transition-all flex items-center justify-center ${saveUsername ? 'bg-[var(--bg-yellow-primary)] border-[var(--bg-yellow-primary)]' : 'bg-transparent border-[var(--border-light)] group-hover:border-[var(--text-dark-secondary)]'
                                    }`}
                            >
                                {saveUsername && <Check size={14} className="text-[var(--bg-navy-secondary)]" strokeWidth={3} />}
                            </div>
                            <span className="font-inter text-[var(--text-dark-secondary)] text-[15px] font-medium transition-colors group-hover:text-[var(--text-black)]">
                                Save email
                            </span>
                        </button>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[60px] bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--bg-navy-secondary)] font-inter font-bold text-[17px] rounded-[3px] transition-all active:scale-[0.985] cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Log In"}
                        </button>
                    </form>

                    {/* Support & Account Links */}
                    <div className="mt-8 sm:mt-10 flex flex-col items-center gap-6 sm:gap-8">
                        <button
                            onClick={() => setView('forgot')}
                            className="text-[var(--text-dark-secondary)] font-inter font-semibold text-[15px] hover:text-[var(--text-black)] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[var(--text-black)] hover:after:w-full after:transition-all cursor-pointer"
                        >
                            Forgot your login details?
                        </button>
                        <button
                            onClick={openSignupModal}
                            className="text-[var(--text-dark-secondary)] font-inter font-semibold text-[15px] hover:text-[var(--text-black)] transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[var(--text-black)] hover:after:w-full after:transition-all cursor-pointer"
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
