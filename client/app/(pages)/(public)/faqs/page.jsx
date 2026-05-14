"use client";

import React, { useEffect, useState } from "react";
import PageTitleBar from "@/app/components/web/PageTitleBar";
import { ChevronDown } from "lucide-react";
import { faqService } from "@/app/services";

export default function FaqPage() {
    const [openId, setOpenId] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await faqService.getAll();
                setFaqs(response?.data || []);
            } catch (err) {
                const apiError = err;
                setError(apiError?.response?.data?.message?.user || apiError?.response?.data?.message || 'Failed to load FAQs.');
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

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
                    {loading ? (
                        <p className="font-inter text-[var(--text-tertiary)] text-[12px] text-center py-8">Loading FAQs...</p>
                    ) : error ? (
                        <p className="font-inter text-red-400 text-[12px] text-center py-8">{error}</p>
                    ) : faqs.length === 0 ? (
                        <p className="font-inter text-[var(--text-tertiary)] text-[12px] text-center py-8">No FAQs found.</p>
                    ) : faqs.map((faq) => {
                        const isOpen = openId === faq._id;
                        return (
                            <div
                                key={faq._id}
                                className={`border rounded-[6px] transition-colors duration-200 ${isOpen
                                    ? "border-[var(--bg-green-accent)] bg-[var(--bg-secondary)]"
                                    : "border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                                    }`}
                            >
                                {/* Question row */}
                                <button
                                    onClick={() => toggle(faq._id)}
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
