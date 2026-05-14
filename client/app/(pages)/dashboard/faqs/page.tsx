'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, X, Save, HelpCircle } from 'lucide-react';
import { faqService } from '@/app/services';

interface Faq {
    id: string;
    question: string;
    answer: string;
}

interface ModalState {
    open: boolean;
    mode: 'add' | 'edit';
    faq: Faq | null;
}

export default function FaqsPage() {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add', faq: null });
    const [formQuestion, setFormQuestion] = useState('');
    const [formAnswer, setFormAnswer] = useState('');
    const [formError, setFormError] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Drag & drop state
    const dragIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const fetchFaqs = async () => {
        try {
            const response = await faqService.getAll();
            const normalized = (response?.data || []).map((faq: { _id: string; question: string; answer: string }) => ({
                id: faq._id,
                question: faq.question,
                answer: faq.answer,
            }));
            setFaqs(normalized);
        } catch {
            setFaqs([]);
        }
    };

    useEffect(() => {
        let active = true;

        const loadFaqs = async () => {
            try {
                const response = await faqService.getAll();
                if (!active) return;
                const normalized = (response?.data || []).map((faq: { _id: string; question: string; answer: string }) => ({
                    id: faq._id,
                    question: faq.question,
                    answer: faq.answer,
                }));
                setFaqs(normalized);
            } catch {
                if (!active) return;
                setFaqs([]);
            }
        };

        void loadFaqs();

        return () => {
            active = false;
        };
    }, []);

    // Modal helpers
    const openAdd = () => {
        setFormQuestion('');
        setFormAnswer('');
        setFormError('');
        setModal({ open: true, mode: 'add', faq: null });
    };

    const openEdit = (faq: Faq) => {
        setFormQuestion(faq.question);
        setFormAnswer(faq.answer);
        setFormError('');
        setModal({ open: true, mode: 'edit', faq });
    };

    const closeModal = () => setModal({ open: false, mode: 'add', faq: null });

    const handleSave = async () => {
        const question = formQuestion.trim();
        const answer = formAnswer.trim();

        if (!question || !answer) {
            setFormError('Both question and answer are required.');
            return;
        }

        if (modal.mode === 'add') {
            try {
                await faqService.create({ question, answer });
                await fetchFaqs();
            } catch {
                setFormError('Failed to save FAQ.');
                return;
            }
        } else if (modal.faq) {
            try {
                await faqService.update(modal.faq.id, { question, answer });
                await fetchFaqs();
            } catch {
                setFormError('Failed to update FAQ.');
                return;
            }
        }
        closeModal();
    };

    const handleDelete = async (id: string) => {
        try {
            await faqService.remove(id);
            await fetchFaqs();
            setDeleteConfirmId(null);
            if (expandedId === id) setExpandedId(null);
        } catch {
            setDeleteConfirmId(null);
        }
    };

    const onDragStart = (index: number, id: string) => {
        dragIndex.current = index;
        setDraggingId(id);
    };

    const onDragEnter = (index: number, id: string) => {
        dragOverIndex.current = index;
        setDragOverId(id);
    };

    const onDragEnd = () => {
        if (dragIndex.current !== null && dragOverIndex.current !== null && dragIndex.current !== dragOverIndex.current) {
            const updated = [...faqs];
            const [moved] = updated.splice(dragIndex.current, 1);
            updated.splice(dragOverIndex.current, 0, moved);
            setFaqs(updated);
        }
        dragIndex.current = null;
        dragOverIndex.current = null;
        setDraggingId(null);
        setDragOverId(null);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-dash-text-primary">FAQs</h2>
                    <p className="text-sm text-dash-text-secondary mt-0.5">
                        Manage frequently asked questions shown to users. Drag rows to reorder.
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-dash-active-text hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
                >
                    <Plus size={16} />
                    Add FAQ
                </button>
            </div>


            {/* FAQ list */}
            <div className="bg-white rounded-md border border-dash-border overflow-hidden flex-1">
                {/* Table header */}
                <div className="grid grid-cols-[32px_40px_1fr_120px] items-center px-4 py-3 bg-gray-50 border-b border-dash-border text-xs font-bold text-dash-text-secondary uppercase tracking-wider">
                    <span></span>
                    <span>#</span>
                    <span>Question</span>
                    <span className="text-right">Actions</span>
                </div>

                {faqs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-dash-text-secondary">
                        <HelpCircle size={40} className="mb-3 opacity-30" />
                        <p className="font-medium">No FAQs yet</p>
                        <p className="text-sm mt-1">Click &quot;Add FAQ&quot; to create your first entry.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-dash-border">
                        {faqs.map((faq, index) => {
                            const isExpanded = expandedId === faq.id;
                            const isDragging = draggingId === faq.id;
                            const isDragOver = dragOverId === faq.id && draggingId !== faq.id;

                            return (
                                <div
                                    key={faq.id}
                                    draggable
                                    onDragStart={() => onDragStart(index, faq.id)}
                                    onDragEnter={() => onDragEnter(index, faq.id)}
                                    onDragEnd={onDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={`transition-all duration-150 ${isDragging ? 'opacity-40 scale-[0.99]' : 'opacity-100'} ${isDragOver ? 'bg-blue-50 border-l-2 border-l-dash-active-text' : ''}`}
                                >
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                                        className="grid grid-cols-[32px_40px_1fr_120px] items-center px-4 py-3.5 hover:bg-gray-50/70 transition-colors w-full text-left"
                                    >
                                        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                                            <GripVertical size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-dash-text-secondary">{index + 1}</span>
                                        <div className="flex items-center gap-2 text-left group">
                                            <span className="text-sm font-semibold text-dash-text-primary group-hover:text-dash-active-text transition-colors line-clamp-1">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={`shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <span
                                                onClick={(e) => { e.stopPropagation(); openEdit(faq); }}
                                                className="w-8 h-8 flex items-center justify-center rounded-md border border-dash-border hover:border-dash-active-text hover:bg-blue-50 hover:text-dash-active-text text-gray-400 transition-all cursor-pointer"
                                                title="Edit"
                                            >
                                                <Pencil size={13} />
                                            </span>
                                            <span
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(deleteConfirmId === faq.id ? null : faq.id); }}
                                                className="w-8 h-8 flex items-center justify-center rounded-md border border-dash-border hover:border-red-300 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 size={13} />
                                            </span>
                                        </div>
                                    </button>

                                    {deleteConfirmId === faq.id && (
                                        <div className="flex items-center justify-end gap-2 px-4 pb-3">
                                            <button
                                                onClick={() => handleDelete(faq.id)}
                                                className="px-3 py-1.5 text-[12px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer transition-colors"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(null)}
                                                className="px-3 py-1.5 text-[12px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md cursor-pointer transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-0 pl-[88px]">
                                            <p className="text-sm text-dash-text-secondary leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-lg bg-white rounded-md shadow-2xl border border-dash-border overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dash-border bg-gray-50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
                                    <HelpCircle size={16} className="text-dash-active-text" />
                                </div>
                                <h3 className="font-bold text-dash-text-primary text-[15px]">
                                    {modal.mode === 'add' ? 'Add New FAQ' : 'Edit FAQ'}
                                </h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            {formError && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">
                                    Question
                                </label>
                                <input
                                    value={formQuestion}
                                    onChange={(e) => setFormQuestion(e.target.value)}
                                    placeholder="Enter the FAQ question..."
                                    className="w-full h-11 px-3 border border-dash-border rounded-md text-sm text-dash-text-primary placeholder:text-gray-400 focus:outline-none focus:border-dash-active-text focus:ring-1 focus:ring-blue-200 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-dash-text-secondary uppercase tracking-wider">
                                    Answer
                                </label>
                                <textarea
                                    value={formAnswer}
                                    onChange={(e) => setFormAnswer(e.target.value)}
                                    placeholder="Enter the FAQ answer..."
                                    rows={5}
                                    className="w-full px-3 py-2.5 border border-dash-border rounded-md text-sm text-dash-text-primary placeholder:text-gray-400 focus:outline-none focus:border-dash-active-text focus:ring-1 focus:ring-blue-200 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dash-border bg-gray-50">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-semibold text-dash-text-secondary hover:text-dash-text-primary border border-dash-border hover:border-gray-400 rounded-md transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2 bg-dash-active-text hover:bg-blue-700 text-white text-sm font-bold rounded-md transition-colors cursor-pointer"
                            >
                                <Save size={14} />
                                {modal.mode === 'add' ? 'Add FAQ' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
