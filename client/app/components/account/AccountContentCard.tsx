"use client";

interface AccountContentCardProps {
    data: {
        heading: string;
        description: string;
        buttonText: string;
    };
    onButtonClick?: () => void;
}

export default function AccountContentCard({ data, onButtonClick }: AccountContentCardProps) {
    return (
        <div
            className="relative flex flex-col items-center justify-center border border-[var(--border-white)] rounded-[10px] bg-[var(--bg-secondary)]/50 backdrop-blur-sm px-6 text-center w-full max-w-[784px] min-h-[237px]"
        >
            {/* Subtle Horizontal Line */}
            <div className="absolute top-[45%] left-0 w-full h-[1px] bg-[var(--text-primary)]/5 pointer-events-none"></div>

            <h2 className="font-krona-one font-normal text-[16px] leading-[100%] tracking-normal text-[var(--text-primary)] text-center mb-4 z-10 uppercase">
                {data.heading}
            </h2>

            <p className="font-inter text-[var(--text-tertiary)] text-sm md:text-[14px] max-w-[480px] leading-relaxed mb-6 z-10">
                {data.description}
            </p>

            <div className="flex items-center gap-4 z-10">
                <button
                    onClick={onButtonClick}
                    className="bg-[var(--bg-yellow-primary)] hover:bg-[var(--bg-yellow-hover-alt)] text-[var(--text-black)] font-inter font-bold text-[14px] px-4 py-1 rounded-[10px] transition-colors cursor-pointer"
                >
                    {data.buttonText}
                </button>
            </div>
        </div>
    );
}
