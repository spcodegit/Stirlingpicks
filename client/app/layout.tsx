import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Orbitron, Krona_One, Raleway } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { BetProvider } from "./context/BetContext";
import AuthModal from "./components/auth/AuthModal";
import VerifyEmailHandler from "./components/auth/VerifyEmailHandler";
import BetSlip from "./components/sports/BetSlip";
import DepositModal from "./components/modals/DepositModal";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter-family",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron-family",
  subsets: ["latin"],
  display: "swap",
});

const kronaOne = Krona_One({
  variable: "--font-krona-family",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway-family",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StirlingPicks - Sports Betting & Picks",
  description: "Your premium sports betting and picks platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${kronaOne.variable} ${raleway.variable}`}>
      <body
        cz-shortcut-listen="true"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <BetProvider>
            {children}
            <VerifyEmailHandler />
            <AuthModal />
            <BetSlip />
            <DepositModal />
          </BetProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
