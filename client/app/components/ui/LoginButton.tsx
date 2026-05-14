'use client';
import React from 'react';
import Link from 'next/link';

interface LoginButtonProps {
    href?: string;
    onClick?: () => void;
    className?: string;
}

export default function LoginButton({
    href = '/login',
    onClick,
    className = ''
}: LoginButtonProps) {
    const buttonStyles = `
    inline-flex items-center justify-center
    min-w-[40px] h-[32px] px-2 sm:min-w-[50px] sm:h-[39px] sm:px-4
    bg-[var(--bg-yellow-primary)] text-[var(--text-black)]
    font-medium text-[12px] sm:text-[16px]
    rounded-[8px] sm:rounded-[10px]
    border border-[var(--bg-yellow-border)]
    cursor-pointer
    transition-all duration-200 ease-in-out
    hover:bg-[var(--bg-yellow-hover-alt)] hover:shadow-sm
    active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-[var(--bg-yellow-primary)] focus:ring-offset-1
    ${className}
  `.trim().replace(/\s+/g, ' ');

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={buttonStyles}
                aria-label="Login"
            >
                Login
            </button>
        );
    }

    return (
        <Link href={href} className={buttonStyles} aria-label="Login">
            Login
        </Link>
    );
}
