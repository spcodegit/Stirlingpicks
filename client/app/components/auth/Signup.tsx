"use client";

import React, { useState } from "react";
import { User, X, Eye, Loader2, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/images/logo-2.png";

export default function Signup() {
    const { login, closeSignupModal, openLoginModal } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        age: "",
        gender: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const walletSPromoCode = typeof window !== "undefined"
                ? localStorage.getItem("signupWalletSPromoCode")
                : null;

            const payload = walletSPromoCode
                ? { ...formData, walletS: walletSPromoCode }
                : formData;

            const data = await authService.register(payload);

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

                setSuccess(true);
                login(token, userData);
                if (typeof window !== "undefined") {
                    localStorage.removeItem("signupWalletSPromoCode");
                }

                // Close modal after 4 seconds
                setTimeout(() => {
                    router.push("/");
                }, 4000);
            } else {
                const errorMessage = data.message;
                setError(typeof errorMessage === 'object' ? (errorMessage.user || "Server Error") : (errorMessage || "Registration failed. Please try again."));
            }
        } catch (err: unknown) {
            console.error("Signup Error:", err);
            const apiErr = err as { response?: { data?: { message?: string | { user?: string; system?: string } } }; message?: string };
            const errorMessage = apiErr.response?.data?.message || apiErr.message || "Registration failed. Please try again.";
            setError(typeof errorMessage === 'object' ? (errorMessage.user || errorMessage.system || "Server Error") : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeSignupModal}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[500px] bg-[var(--bg-white)] shadow-2xl rounded-sm overflow-hidden border border-[var(--border-light)] animate-in fade-in zoom-in duration-300">
                {/* Header Bar */}
                <div className="relative h-[56px] bg-[var(--bg-green-header)] flex items-center px-4">
                    <div
                        className="absolute inset-0 opacity-[0.1]"
                        style={{
                            backgroundImage: `linear-gradient(45deg, var(--bg-green-header) 25%, transparent 25%, transparent 50%, var(--bg-green-header) 50%, var(--bg-green-header) 75%, transparent 75%, transparent)`,
                            backgroundSize: '4px 4px'
                        }}
                    ></div>

                    <div className="relative flex items-center gap-2.5 z-10 transition-colors group">
                        <User size={18} className="text-[var(--bg-navy-secondary)]" />
                        <span className="text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] tracking-wide">Create Account</span>
                    </div>

                    <button
                        onClick={closeSignupModal}
                        className="relative ml-auto p-1 text-[var(--bg-navy-secondary)]/70 hover:text-[var(--bg-navy-secondary)] transition-all z-20 cursor-pointer"
                    >
                        <X size={26} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Brand Section */}
                <div className="bg-[var(--bg-green-card)] py-2 sm:py-3 px-6 sm:px-8 flex items-center justify-between border-b border-[var(--border-light)]">
                    <div className="flex items-center select-none">
                        <Image
                            src={logo}
                            alt="Stirling Picks"
                            className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] object-contain bg-white rounded-full"
                        />
                    </div>

                    <div className="text-right">
                        <p className="text-[var(--text-white)] font-inter text-[12px] mb-0.5">Already have an account?</p>
                        <button onClick={openLoginModal} className="text-[var(--text-yellow)] font-inter font-bold text-[13px] hover:text-[var(--text-yellow-hover)] transition-colors tracking-tight cursor-pointer">
                            Log In
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto no-scrollbar bg-[var(--bg-white)]">
                    {!success ? (
                        <form className="space-y-4" onSubmit={handleSignup}>
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Name */}
                                <div className="relative group">
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="relative group">
                                    <input
                                        name="phone"
                                        type="text"
                                        placeholder="Phone Number"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Age */}
                                <div className="relative group">
                                    <input
                                        name="age"
                                        type="number"
                                        placeholder="Age"
                                        required
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                    />
                                </div>

                                <div className="relative group">
                                    <select
                                        name="gender"
                                        required
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="relative group">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                />
                            </div>

                            {/* Address */}
                            <div className="relative group">
                                <input
                                    name="address"
                                    type="text"
                                    placeholder="Home Address"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full h-[48px] px-4 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div className="relative group">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create Password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full h-[48px] px-4 pr-12 bg-[var(--bg-white)] border border-[var(--border-light)] rounded-[3px] font-inter text-[var(--text-dark)] text-[14px] placeholder:text-[var(--text-gray-placeholder)] focus:outline-none focus:border-[var(--bg-yellow-primary)] focus:ring-1 focus:ring-[var(--bg-yellow-primary)]/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dark-secondary)] hover:text-[var(--text-black)] transition-colors cursor-pointer"
                                >
                                    <Eye size={18} className={showPassword ? "text-[var(--bg-yellow-primary)]" : ""} />
                                </button>
                            </div>

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[52px] mt-2 bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--bg-navy-secondary)] font-inter font-bold text-[16px] rounded-[3px] transition-all active:scale-[0.985] cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign Up"}
                            </button>
                        </form>
                    ) : (
                        <div className="py-8 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                                <Mail size={40} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-4 font-inter">Check Your Email!</h2>
                            <div className="p-4 bg-[var(--bg-green-primary)]/10 border border-[var(--bg-green-primary)]/20 rounded-xl mb-6">
                                <p className="text-[var(--bg-navy-secondary)] font-inter font-medium leading-relaxed">
                                    Account created successfully! We&apos;ve sent a verification link to <span className="font-bold underline">{formData.email}</span>.
                                </p>
                            </div>
                            <p className="text-[var(--text-dark-secondary)] text-sm font-inter mb-8">
                                Please click the link in your email to verify your account and start winning with Stirling Picks.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={closeSignupModal}
                                    className="w-full h-[52px] bg-[var(--bg-navy-secondary)] text-white font-inter font-bold rounded-xl transition-all hover:bg-black flex items-center justify-center gap-2 group"
                                >
                                    Close and Explore
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {!success && (
                        <p className="mt-4 sm:mt-6 text-center text-[var(--text-dark-secondary)] text-[12px] font-inter px-4 leading-relaxed">
                            By signing up, you agree to our <Link href="/terms" className="text-[var(--bg-green-header)] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[var(--bg-green-header)] hover:underline">Privacy Policy</Link>.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
