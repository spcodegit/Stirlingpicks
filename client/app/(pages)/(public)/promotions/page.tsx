"use client";

import React from "react";
import PageTitleBar from "@/app/components/web/PageTitleBar";
import PromotionCard from "@/app/components/web/PromotionCard";

const PROMOTIONS_DATA = [
  {
    id: 1,
    title: <><span className="block text-[var(--text-primary)]">NEW</span>CUSTOMER</>,
    subtitle: "Get Access Now",
    buttonText: "OPEN NOW",
    imageSrc: "/images/promotions/1.png",
    footerText: ""
  },
  {
    id: 2,
    title: <><span className="block text-[var(--text-primary)]">Get Game</span><span className="text-[var(--text-yellow)]">Tickets</span></>,
    subtitle: "Redeem Today",
    buttonText: "SEE MORE",
    imageSrc: "/images/promotions/2.png",
    footerText: "As a Official Global Partner with Many Renowned Sports Firms We Distribute Tickets To Matches On a Regular Occasion Throughout The Season. Restrictions and T&Cs apply."
  },
  {
    id: 3,
    title: <><span className="block text-[var(--text-yellow)]">Guaranteed</span><span className="text-[var(--text-primary)] text-[20px]">Daily Rewards</span></>,
    subtitle: "Stack Your Stirling Points",
    buttonText: "SEE MORE",
    imageSrc: "/images/promotions/3.png",
    footerText: "Open PRO Account, 1 spin per customer /day. Rewards on Wheel: Cash, Points, Bonus, Free Spins, Free Bet, Free Bingo Ticket. Rewards valid 7 days (exc. cash). Guaranteed reward on Supercharged Days. Reward restrictions and T&Cs apply."
  },
  {
    id: 4,
    title: <><span className="block text-[var(--text-primary)] text-[14px]">Get <span className="text-[var(--text-yellow)]">Phenomenal</span></span><span className="text-[var(--text-primary)] text-[14px]">Sports Odds</span></>,
    subtitle: "On Demand Picks",
    buttonText: "SEE MORE",
    imageSrc: "/images/promotions/4.png",
    footerText: "Certain deposit methods & bet types excl. Min first £/€5 bet within 14 days of account reg at min odds 1/2 to get 4x £/€5 free bets. Free bets available to use on selected sportsbook markets only. Free bets valid for 7 days, stake not returned. Restrictions + T&Cs apply."
  },
  {
    id: 5,
    title: <><span className="block text-[var(--text-primary)]"><span className="text-[var(--text-yellow)]">2X</span> Double</span>Your Chances</>,
    subtitle: "Regular Offer Rollouts",
    buttonText: "SEE MORE",
    imageSrc: "/images/promotions/5.png",
    footerText: "Max boost limits may apply. Some deposit types, markets & bet types excl. T&Cs apply. PLEASE BET RESPONSIBLY. For support and information see GamblingCare.ie"
  }
];

export default function PromotionsPage() {
  return (
    <div className="w-full h-full bg-[var(--bg-primary)] flex flex-col overflow-hidden">
      <PageTitleBar title="Promotions" />

      <div className="py-16 px-6 flex-1 flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-wrap gap-8 space-y-8 ">
          {PROMOTIONS_DATA.map((promo) => (
            <PromotionCard
              key={promo.id}
              title={promo.title}
              subtitle={promo.subtitle}
              buttonText={promo.buttonText}
              imageSrc={promo.imageSrc}
              footerText={promo.footerText}
            />
          ))}
        </div>
      </div>
    </div>
  );
}