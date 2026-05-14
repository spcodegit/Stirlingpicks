"use client";

import React, { useState, useEffect } from "react";
import { planService, PlanRecord } from '@/app/services';
import PlanPreviewTable from '@/app/components/plans/PlanPreviewTable';
import PageTitleBar from "@/app/components/web/PageTitleBar";
import AccountToggle from "@/app/components/account/AccountToggle";
import AccountContentCard from "@/app/components/account/AccountContentCard";
import { useAuth } from "@/app/context/AuthContext";

// Mock Data
const ACCOUNT_DATA = {
  standard: {
    heading: "Sports Betting Just Got BETTer",
    description: "Experience betting in a standard account. Fund your account today and get access to instant Odd feeds.",
    buttonText: "Add Amount",
  },
  professional: {
    heading: "Pro Level Betting Experience",
    description: "Unlock advanced tools, higher limits, and exclusive market insights with our professional account tier.",
    buttonText: "Go Pro",
  },
};

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"standard" | "professional">("standard");
  const { openDepositModal } = useAuth();
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'professional' && plans.length === 0) {
      const fetchPlans = async () => {
        setTimeout(() => {
          if (isMounted) setLoadingPlans(true);
        }, 0);
        try {
          const res = await planService.getAll();
          if (isMounted) setPlans(res.data || []);
        } catch (error) {
          console.error("Failed to fetch plans", error);
        } finally {
          if (isMounted) setLoadingPlans(false);
        }
      };
      fetchPlans();
    }
    return () => { isMounted = false; };
  }, [activeTab, plans.length]);

  const handleBuyPlan = (plan: PlanRecord) => {
    openDepositModal({
      amount: plan.fee,
      planId: plan._id,
      accountType: 'professional',
    });
  };

  const handleButtonClick = () => {
    if (activeTab === 'standard') {
      openDepositModal();
    } else {
      // Logic for professional account
      console.log("Go Pro clicked");
    }
  };

  return (
    <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
      <PageTitleBar title="Account" />

      <div className="flex-1 flex flex-col items-center px-4 min-h-0 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-[1240px] flex flex-col items-center justify-center py-8">
          <div className="mb-4">
            <AccountToggle
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          {activeTab === 'standard' ? (
            <AccountContentCard
              data={ACCOUNT_DATA[activeTab]}
              onButtonClick={handleButtonClick}
            />
          ) : (
            <div className="w-full animate-in fade-in duration-500">
                <div className="text-center mb-12">
                    <h3 className="font-krona-one font-normal text-[16px] leading-[100%] tracking-normal text-[var(--text-primary)] uppercase mb-4">{ACCOUNT_DATA.professional.heading}</h3>
                    <p className="font-inter text-[var(--text-tertiary)] text-sm md:text-[14px] max-w-[480px] mx-auto leading-relaxed">
                      {ACCOUNT_DATA.professional.description}
                    </p>
                </div>
                <PlanPreviewTable plans={plans} loading={loadingPlans} variant="public" onBuyPlan={handleBuyPlan} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}