'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface RowActionMenuProps {
    onDetails: () => void;
}

export default function RowActionMenu({ onDetails }: RowActionMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleOutside = (event: MouseEvent) => {
            if (!menuRef.current) return;
            const target = event.target as Node;
            if (!menuRef.current.contains(target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div ref={menuRef} className="relative inline-block">
            <button
                className="p-1.5 text-[var(--text-muted)] hover:text-white transition-colors rounded-sm hover:bg-white/10"
                onClick={() => setOpen((prev) => !prev)}
                type="button"
            >
                <MoreHorizontal size={16} />
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-28 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm shadow-lg z-30">
                    <button
                        className="w-full text-left px-3 py-2 text-[12px] text-white hover:bg-white/10 font-inter"
                        onClick={() => {
                            onDetails();
                            setOpen(false);
                        }}
                        type="button"
                    >
                        Details
                    </button>
                </div>
            )}
        </div>
    );
}
