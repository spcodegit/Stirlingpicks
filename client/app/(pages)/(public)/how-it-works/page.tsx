import PageTitleBar from "@/app/components/web/PageTitleBar";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
      <PageTitleBar title="How It Works" />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
        {/* Standard Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center border-b border-[var(--border-primary)]/30 min-h-0 overflow-hidden">
          <h2 className="font-orbitron font-bold text-[var(--text-primary)] text-[12px] md:text-[14px] lg:text-[15px] mb-0.5">Standard</h2>
          <span className="font-orbitron font-bold text-[var(--text-yellow)] text-[8px] mb-2 md:mb-4">1X</span>
          <p className="max-w-[363px] font-inter text-[var(--text-secondary)] text-[10px] md:text-[12px] lg:text-[12px] max-w-2xl leading-relaxed mb-4 md:mb-6 line-clamp-2 md:line-clamp-none">
            Experience betting in a standard account. Fund your account today and get access to instant Odd feeds.
          </p>
          <Link href="/account" className="w-[99px] h-[24px] flex items-center justify-center bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--text-black)] font-orbitron font-bold text-[11px] rounded-[10px] border border-black/10 transition-all duration-200">
            View Now
          </Link>
        </div>

        {/* Professional Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 px-4 text-center min-h-0 overflow-hidden">
          <h2 className="font-orbitron font-bold text-[var(--text-primary)] text-[12px] md:text-[14px] lg:text-[15px] mb-0.5">Professional</h2>
          <span className="font-orbitron font-bold text-[var(--text-yellow)] text-[8px] mb-2 md:mb-4">1000X</span>
          <p className="max-w-[520px] font-inter text-[var(--text-secondary)] text-[10px] md:text-[12px] lg:text-[12px] max-w-2xl leading-relaxed mb-4 md:mb-6 line-clamp-3 md:line-clamp-none">
            Up for the challenge! Experience Betting in our very own tailored professional accounts. We Fund professional accounts up to $100,000 based on Betting performance. Amplify your earnings today.
          </p>
          <Link href="/account" className="w-[99px] h-[24px] flex items-center justify-center bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover)] text-[var(--text-black)] font-orbitron font-bold text-[11px] rounded-[10px] border border-black/10 transition-all duration-200">
            View Now
          </Link>
        </div>
      </div>
    </div>
  );
}