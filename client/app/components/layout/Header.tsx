'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginButton from '../ui/LoginButton';
import SignupButton from '../ui/SignupButton';
import { useAuth } from '../../context/AuthContext';
import UserDropdown from './UserDropdown';

import { Menu, ShieldAlert,} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { openLoginModal, openSignupModal, user, logout } = useAuth();

  return (
    <header
      className="w-full bg-[var(--bg-green-header)] h-[48px] md:h-[42px] mx-auto"
    >
      <div className="flex items-center justify-between h-full px-2 sm:px-4 gap-2 sm:gap-4">
        {/* Mobile Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 rounded-md transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} className="sm:w-6 sm:h-6" />
        </button>

        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-2 h-full flex-shrink min-w-0"
          aria-label="StirlingPicks Home"
        >
          <div
            className="relative h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full overflow-hidden bg-white"
          >
            <Image
              src="/images/logo.png"
              alt="StirlingPicks Logo"
              fill
              sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, 40px"
              className="object-cover scale-[1.1] inset-[-2px]"
              priority
            />
          </div>
          <span className="text-[var(--text-primary)] font-bold text-[16px] sm:text-[24px] md:text-[36px] font-orbitron tracking-wide uppercase truncate">
            STIRLING<span className="hidden xs:inline sm:inline"> PICKS</span>
          </span>
        </Link>

        <nav
          className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0"
          aria-label="User actions"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                {/* Verification Badge */}
                <div className="flex items-center">
                  {!user.isVerified && (
                    <>
                      <button
                        className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-600 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all group cursor-pointer"
                      >
                        <ShieldAlert size={12} className="sm:w-[14px] sm:h-[14px] group-hover:animate-pulse" strokeWidth={2.5} />
                        <span className="text-[9px] sm:text-[10px] font-inter font-bold uppercase tracking-wider">Unverified</span>
                      </button>

                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-white text-[11px] py-2 px-3 rounded-lg shadow-xl opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all z-[100] text-center pointer-events-none">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        Check your email & enter code to verify your account
                      </div>
                    </>
                  )}
                </div>

                <UserDropdown user={user} logout={logout} />
              </>
            ) : (
              <>
                <LoginButton onClick={openLoginModal} />
                <SignupButton onClick={openSignupModal} />
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

