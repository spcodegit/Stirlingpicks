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
    footerText: "As a Official Global Partner with Many Renowned Sports Firms We distribute Tickets to Matches On a Regular Occasion Throughout The Season. Restrictions + T&Cs apply."
  },
  {
    id: 3,
    title: <><span className="block text-[var(--text-yellow)]">Guaranteed</span><span className="text-[var(--text-primary)] text-[20px]">Daily Rewards</span></>,
    subtitle: "Stack Your Stirling Points",
    buttonText: "SEE MORE",
    imageSrc: "/images/promotions/3.png",
    footerText: "1 spin per customer per day. Rewards available: Cash, Casino Bonus, Free Spins, Free Bet, Free Bingo Ticket. Valid 7 days (except cash). Reward restrictions and T&Cs apply."
  },
  {
    id: 4,
    title: <><span className="block text-[var(--text-primary)]">Get <span className="text-[var(--text-yellow)]">Phenomenal</span></span><span className="text-[var(--text-primary)]">Sports Odds</span></>,
    subtitle: "On Demand Picks",
    buttonText: "SEE MORE",
    imageSrc: "/images/promotions/4.png",
    footerText: "Certain deposit methods & bet types excl. Min first £/€5 bet within 14 days of account reg at min odds 1/2 to get 4x €/€5 free bets. Restrictions + T&Cs apply."
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

      <div className="pt-10 pb-16 px-8 md:px-12 flex-1 flex flex-col overflow-y-auto no-scrollbar w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-20">
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
