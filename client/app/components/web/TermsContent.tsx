"use client";

const terms = [
  "These Promotional Terms & Conditions apply to this Sports Promotion. They should be read alongside our General Website Terms & Conditions. These terms can be accessed here.",
  "1. PROMOTIONAL PERIOD",
  "2. This Sports Promotion is available to qualifying customers from 18:00 20/05/2021 – 23:59 31/12/2024. If we decide to withdraw this Sports Promotion, this will not impact any Qualifying Bets you have placed during the Promotional Period before such withdrawal.",
  "3. WHO QUALIFIES FOR THIS SPORTS PROMOTION",
  "4. This Sports Promotion is open to UK & Republic of Ireland residents aged 18 years or over opening a NEW Online or Mobile account in either £/€ currency.",
  "5. This Sports Promotion is not available to customers who open NEW accounts & deposit funds with Prepaid Cards, Moneybookers, InstantBank, Paypal, Paysafe, Neteller or Skrill.",
  "6. Employees of the Promoter, any advertising agency or web company connected with the promoter or any such person's agents or members of their families or households, are not eligible to participate in this Sports Promotion. The promoter reserves the right to verify the eligibility of all participants.",
  "7. Each customer is eligible to receive only one sign-up offer",
  "8. HOW TO CLAIM THIS SPORTS PROMOTION",
  "9. To claim this Sports Promotion, you must register a NEW account, making a deposit of £5 or more and place a Qualifying Bet/s (detailed in term 7). If you don't follow these steps the bets will not be applied to your account.",
  "10. The Qualifying bet/s will be made of a real money sports bet of at least £5 win or cumulative stakes of up to £5, at fractional odds totalling 1/2 or greater. For a single line accumulator bet, each individual selection of the bet must at fractional odds of 1/2 or greater to be deemed a Qualifying Bet. Please note that only the win parts of win/each-way bets will qualify.",
  "11. A bet will not be considered a Qualifying Bet if it is wagered on Tote or Pools.",
  "12. The Qualifying Bet/s must be made within 14 days of your account registration. Bets placed after this date will not qualify for this Sports Promotion.",
  "13. Once you have placed your first Qualifying Bet, we will credit your account with 4 x £5 free bets.",
  "14. RESTRICTIONS ON YOUR FREE BET",
  "15. Your free bet must be used within 7 days of it being credited to your account, otherwise it will expire.",
  "16. Free bets cannot be redeemed for cash at any time.",
  "17. Your free bet must be wagered in full, on any of the following sportsbook markets: Football, Horse Racing, Greyhound Racing, Tennis, Basketball, American Football, Boxing, Rugby Union, Rugby League, UFC, Cricket, Table Tennis, Darts, Golf, Snooker, Pool, Hockey, Volleyball, Beach Volleyball, Gaelic Football, Pool, Specials (excluding tote & pools).",
  "18. The Free Bets obtained from this offer must be used on 4 separate sportsbook markets.",
  "19. Free bets may be used in conjunction with any Virtual Sports markets.",
  "20. Please note that the value of your free bet will not be included in any winnings.",
  "21. Your free bet is not returned if your free bet wager becomes void.",
  "22. The same Maximum Pay Out restrictions set out in our General Website Terms & Conditions will equally apply to this Sports Promotion.",
  "23. IMPORTANT TERMS",
  "24. Promoter: LC International Limited having its registered office at Suite 6, Atlantic Suites, Europort Avenue, Gibraltar",
  "25. This Sports Promotion cannot be used in conjunction with any other Ladbrokes.com Sports Promotion.",
  "26. We reserve the right to change or end any Sports Promotion, if required for legal and/or regulatory reasons.",
  "27. If you have made one or more qualifying bets in relation to this Sports Promotion, but your bets are subsequently restricted by us, we will make sure that this will not materially affect your ability to satisfy the conditions to qualify for this Sports Promotion (if applicable) or to fully benefit from the free bets available.",
  "28. We may place restrictions on your account in order to comply with our legal and regulatory obligations (this could include deposit restrictions and restrictions on the bonus offers that you can participate in. We will not be responsible should these restrictions and/or responsible Safer Gambling measures, affect your ability to complete the requirements of this promotion and/or to receive any bonus, benefits or prizes.",
  "29. PLEASE BET RESPONSIBLY. begambleaware.org"
];

export default function TermsContent() {
  return (
    <div className="w-full bg-black flex justify-center px-4">
      <div className="max-w-[1156px] w-full p-6 md:p-10">
        <div className="space-y-4">
          {terms.map((t, i) => {
            const isHeading = /^[0-9.]+\s[A-Z\s]+$/.test(t) || t.includes("IMPORTANT") || t.includes("PROMOTIONAL PERIOD");
            return (
              <div
                key={i}
                className={`${isHeading
                  ? "text-[var(--bg-green-primary)] font-orbitron font-bold text-lg mt-8 mb-4 uppercase tracking-tight"
                  : "text-[var(--text-secondary)] font-inter text-[15px] leading-relaxed opacity-80"
                  }`}
              >
                {t}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
