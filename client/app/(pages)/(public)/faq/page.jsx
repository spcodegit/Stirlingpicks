"use client";

import React, { useState } from "react";
import PageTitleBar from "@/app/components/web/PageTitleBar";
import { ChevronDown } from "lucide-react";

const FAQS = [
    {
        id: 1,
        question: "What is Stirling Picks?",
        answer: "Stirling Picks is a premier sports betting platform that offers real-time odds, expert picks, and two account tiers — Standard and Professional — giving bettors of every level the tools to maximise their earnings.",
    },
    {
        id: 2,
        question: "What is the difference between a Standard and a Professional account?",
        answer: "A Standard account gives you access to our live odds feeds and betting marketplace. A Professional account is performance-based and can be funded by Stirling Picks up to $100,000 depending on your betting track record, with amplified earning potential.",
    },
    {
        id: 3,
        question: "How do I create an account?",
        answer: "Click the 'Sign Up' button in the top navigation bar, fill in your details, agree to the Terms & Conditions, and verify your email address. Once verified you can log in and start using the platform immediately.",
    },
    {
        id: 4,
        question: "How do I deposit funds?",
        answer: "Navigate to your dashboard and click the 'Deposit' button. We accept a wide range of cryptocurrencies. Select your preferred coin, enter the amount in USD, and send the exact crypto amount to the provided wallet address. Deposits are confirmed on-chain automatically.",
    },
    {
        id: 5,
        question: "Which cryptocurrencies do you accept for deposits?",
        answer: "We support a broad selection of cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), USDT, and many more. The full list of supported currencies is shown when you initiate a deposit.",
    },
    {
        id: 6,
        question: "How long do deposits take to be credited?",
        answer: "Deposits are credited to your wallet balance once the transaction receives the required number of network confirmations. This typically takes between 5 and 30 minutes depending on network congestion and the coin you use.",
    },
    {
        id: 7,
        question: "How do I place a bet?",
        answer: "Browse available sports and matches in the 'Sports' section. Click the odds you want to back to add them to your Bet Slip, enter your stake, and confirm. Your bet is placed instantly and tracked in real time.",
    },
    {
        id: 8,
        question: "How do I withdraw my winnings?",
        answer: "Go to your dashboard, select 'Payouts', enter the cryptocurrency wallet address and amount you wish to withdraw. Withdrawal requests are reviewed and typically processed within 24 hours.",
    },
    {
        id: 9,
        question: "What are Stirling Points?",
        answer: "Stirling Points are earned through regular betting activity and promotions. They can be redeemed for bonuses, free bets, or entered into our Daily Rewards wheel. Visit the Promotions page to see all current point-earning opportunities.",
    },
    {
        id: 10,
        question: "I forgot my password. How do I reset it?",
        answer: "On the login screen click 'Forgot Password', enter the email address linked to your account, and follow the instructions in the reset email we send you. If you do not receive the email, check your spam folder or contact support.",
    },
    {
        id: 11,
        question: "How do I verify my email address?",
        answer: "After registration a verification email is sent to the address you provided. Click the verification link inside that email. If you did not receive it, use the 'Resend verification' option on the verify email screen.",
    },
    {
        id: 12,
        question: "Is my personal information kept secure?",
        answer: "Yes. We use industry-standard encryption and security practices to protect your personal data. We never share your information with third parties without your consent. Please review our Privacy Policy for full details.",
    },
];

export default function FaqPage() {
    const [openId, setOpenId] = useState(null);

    const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

    return (
        <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
            <PageTitleBar title="FAQ" />

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-6 px-4 sm:px-8">
                {/* Intro */}
                <p className="font-inter text-[var(--text-secondary)] text-[11px] sm:text-[12px] text-center mb-6 max-w-xl mx-auto leading-relaxed">
                    Have questions? Find answers to the most common queries about Stirling Picks below.
                </p>

                {/* Accordion */}
                <div className="max-w-2xl mx-auto space-y-2 pb-6">
                    {FAQS.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                            <div
                                key={faq.id}
                                className={`border rounded-[6px] transition-colors duration-200 ${isOpen
                                    ? "border-[var(--bg-green-accent)] bg-[var(--bg-secondary)]"
                                    : "border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                                    }`}
                            >
                                {/* Question row */}
                                <button
                                    onClick={() => toggle(faq.id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                                >
                                    <span className="font-inter font-semibold text-[var(--text-primary)] text-[12px] sm:text-[13px] leading-snug">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`shrink-0 text-[var(--bg-green-accent)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* Answer */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="h-px w-full bg-[var(--border-primary)] mb-3" />
                                        <p className="font-inter text-[var(--text-tertiary)] text-[11px] sm:text-[12px] leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
