import React from 'react';
import { PlanRecord } from '@/app/services';
import { Loader2 } from 'lucide-react';

interface PlanPreviewTableProps {
  plans: PlanRecord[];
  loading?: boolean;
  variant?: 'dashboard' | 'public';
  onBuyPlan?: (plan: PlanRecord) => void;
}

export default function PlanPreviewTable({ plans, loading, variant = 'dashboard', onBuyPlan }: PlanPreviewTableProps) {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className={`w-8 h-8 animate-spin ${variant === 'public' ? 'text-[var(--text-primary)]' : 'text-dash-active-text'}`} />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className={`w-full text-center py-20 font-semibold ${variant === 'public' ? 'text-[var(--text-tertiary)]' : 'text-gray-500'}`}>
        No plans currently available.
      </div>
    );
  }

  // Sort plans by amount
  const sortedPlans = [...plans].sort((a, b) => a.amount - b.amount);

  const isPublic = variant === 'public';
  
  const textPrimary = isPublic ? 'text-[var(--text-primary)]' : 'text-gray-900';
  const textSecondary = isPublic ? 'text-[var(--text-tertiary)] font-krona-one tracking-normal text-[12px] md:text-[13px] uppercase' : 'text-gray-800 font-bold';
  
  const amountBg = isPublic ? 'bg-[var(--bg-secondary)]/60 backdrop-blur-xl  shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative overflow-hidden group' : 'bg-gray-200';
  const amountBgAlt = isPublic ? 'bg-[var(--bg-secondary)]/30 backdrop-blur-md   shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative overflow-hidden group' : 'bg-transparent';
  
  return (
    <div className={`w-full pb-10 ${isPublic ? 'mt-8' : ''}`}>
      {/* Mobile view: Cards */}
      <div className="flex md:hidden flex-col gap-6 w-full">
        {sortedPlans.map((plan, index) => (
          <div key={`mobile-${plan._id}`} className={`w-full flex flex-col rounded-[16px] border overflow-hidden ${isPublic ? 'border-[var(--border-white)] bg-[var(--bg-secondary)]/40 backdrop-blur-md shadow-lg p-6' : 'border-gray-200 bg-white shadow-sm p-5'}`}>
            <div className={`text-center mb-6 pb-6 border-b ${isPublic ? 'border-[var(--border-white)]/10' : 'border-gray-200'}`}>
              <div className={`font-bold ${isPublic ? 'text-[24px] font-krona-one tracking-normal' : 'text-[24px]'} ${textPrimary}`}>
                ${plan.amount}
              </div>
              {isPublic && (
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] mt-2 font-inter font-semibold">Account</div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-[14px] ${textSecondary}`}>Betting Days</span>
                <span className={`text-[14px] font-semibold ${textPrimary}`}>{plan.bettingDays} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-[14px] ${textSecondary}`}>Min Betting Days</span>
                <span className={`text-[14px] font-semibold ${textPrimary}`}>{plan.minBettingDays} Days</span>
              </div>
              <div className={`flex justify-between items-center pt-4 border-t ${isPublic ? 'border-[var(--border-white)]/10' : 'border-gray-100'}`}>
                <span className={`text-[14px] ${textSecondary}`}>Daily Drawdown</span>
                <span className={`text-[14px] font-semibold ${textPrimary}`}>${plan.dailyDrawDownMax}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-[14px] ${textSecondary}`}>Max Drawdown</span>
                <span className={`text-[14px] font-semibold ${textPrimary}`}>${plan.drawDown}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-[14px] ${textSecondary}`}>Fee</span>
                <span className={`text-[14px] font-semibold ${textPrimary}`}>${plan.fee}</span>
              </div>
            </div>
            {isPublic && onBuyPlan && (
              <button
                onClick={() => onBuyPlan(plan)}
                className="mt-6 w-full py-3 bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover-alt)] text-[var(--text-black)] font-inter font-bold text-[14px] rounded-[10px] transition-colors cursor-pointer"
              >
                Buy Plan
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Desktop view: Grid */}
      <div className="hidden md:block w-full overflow-x-auto no-scrollbar">
        <div 
          className="min-w-[1000px] grid items-start gap-x-2"
          style={{ gridTemplateColumns: `180px repeat(${plans.length}, minmax(100px, 1fr))` }}
        >
          <div className="col-span-1 pt-[114px]">
             <div className={`h-[50px] flex items-center text-[14px] ${textSecondary}`}>Betting Days</div>
             <div className={`h-[50px] flex items-center text-[14px] ${textSecondary}`}>Min Betting Days</div>
             <div className={`h-[50px] flex items-center text-[14px] ${textSecondary} mt-6`}>Daily Drawdown</div>
             <div className={`h-[50px] flex items-center text-[14px] ${textSecondary}`}>Max Drawdown</div>
             <div className={`h-[50px] flex items-center text-[14px] ${textSecondary}`}>Fee</div>
          </div>

          {sortedPlans.map((plan, index) => (
             <div key={plan._id} className="flex flex-col items-center">
                <div
                    className={`w-contant px-6 h-[90px] flex flex-col items-center justify-center mb-6 rounded-[12px] transition-all duration-300 cursor-pointer ${
                      index % 2 === 0 ? amountBg : amountBgAlt
                    }`}
                  >
                    {isPublic && (
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--text-primary)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}
                    <div className={`font-bold ${isPublic ? 'text-[24px] font-krona-one tracking-normal' : 'text-[18px]'} ${textPrimary}`}>
                      ${plan.amount}
                    </div>
                    {isPublic && (
                      <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] mt-2 font-inter font-semibold opacity-70 group-hover:opacity-100 transition-opacity">Account</div>
                    )}
                </div>
                <div className={`text-center w-full ${isPublic ? 'font-inter' : ''}`}>
                    <div className={`h-[50px] flex items-center justify-center text-[14px] font-semibold ${textPrimary}`}>{plan.bettingDays} days</div>
                    <div className={`h-[50px] flex items-center justify-center text-[14px] font-semibold ${textPrimary}`}>{plan.minBettingDays} Days</div>
                    <div className={`h-[50px] flex items-center justify-center text-[14px] font-semibold ${textPrimary} mt-6`}>${plan.dailyDrawDownMax}</div>
                    <div className={`h-[50px] flex items-center justify-center text-[14px] font-semibold ${textPrimary}`}>${plan.drawDown}</div>
                    <div className={`h-[50px] flex items-center justify-center text-[14px] font-semibold ${textPrimary}`}>${plan.fee}</div>
                </div>
                {isPublic && onBuyPlan && (
                  <button
                    onClick={() => onBuyPlan(plan)}
                    className="mt-4 px-6 py-2 bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover-alt)] text-[var(--text-black)] font-inter font-bold text-[13px] rounded-[10px] transition-colors cursor-pointer"
                  >
                    Buy Plan
                  </button>
                )}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
