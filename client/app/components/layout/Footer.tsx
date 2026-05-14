"use client";
import { Instagram, X, Github, Music } from "lucide-react";
import Image from "next/image";

import Visa from '../../../public/images/Visa.png';
import Mastercard from '../../../public/images/Mastercard.png';
import Amex from '../../../public/images/Amex.png';
import Discover from '../../../public/images/Discover.png';
import UnionPay from '../../../public/images/UnionPay.png';
import Bitcoin from '../../../public/images/Bitcoin.png';

const paymentIcons = [
  { src: Visa, alt: "Visa" },
  { src: Mastercard, alt: "Mastercard" },
  { src: Amex, alt: "Amex" },
  { src: Discover, alt: "Discover" },
  { src: UnionPay, alt: "UnionPay" },
  { src: Bitcoin, alt: "Bitcoin" },
];

export default function Footer() {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <footer className="w-full h-auto bg-[var(--bg-green-footer)] pt-8 pb-8 px-4">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        {/* Social Icons Row */}
        <div className="w-full flex items-center justify-center gap-4 md:gap-8 mb-6">
          <div className="hidden sm:block flex-1 border-t-2 border-[var(--border-white)]"></div>
          <Instagram className="text-[var(--text-primary)] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" />
          <X className="text-[var(--text-primary)] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" />
          <Github className="text-[var(--text-primary)] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" />
          <Music className="text-[var(--text-primary)] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="hidden sm:block flex-1 border-t-2 border-[var(--border-white)]"></div>
        </div>

        {/* Text Section */}
        <div className="text-center text-[var(--text-black)] font-inter text-[14px] md:text-[16px] font-normal leading-relaxed mb-8 max-w-3xl">
          <p className="mb-2">
            All personal data is provided in accordance with our <a href="#" className="underline font-bold">Privacy Notice</a> and <a href="#" className="underline font-bold">Cookie Policy</a>.
          </p>
          <p className="mb-2">
            Stirling Picks is committed to <a href="#" className="underline font-bold">RESPONSIBLE GAMBLING</a> | <a href="#" className="underline font-bold">FAIRNESS</a>
          </p>
          <p>
            Enjoy the game but play responsibly <a href="https://www.begambleaware.org" className="underline font-bold">www.begambleaware.org</a>
          </p>
        </div>

        {/* Payment Icons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {paymentIcons.map((icon) => (
            <div key={icon.alt} className="rounded-md h-[30px] flex items-center cursor-pointer hover:opacity-80 transition-opacity">
              <Image
                src={icon.src}
                alt={icon.alt}
                width={36}
                height={20}
                className="object-contain"
              />
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex items-center justify-center gap-2 text-[var(--text-black)] font-inter text-[14px] md:text-[16px] opacity-80">
          <span className="text-xl">©</span>
          <span>{year} Stirling Picks. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
