"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function VerifyEmailHandlerContent() {
    const searchParams = useSearchParams();
    const { openVerifyModal, isVerifyModalOpen } = useAuth();
    const code = searchParams.get("code");

    useEffect(() => {
        if (code && !isVerifyModalOpen) {
            openVerifyModal();
        }
    }, [code, openVerifyModal, isVerifyModalOpen]);

    return null;
}

export default function VerifyEmailHandler() {
    return (
        <Suspense fallback={null}>
            <VerifyEmailHandlerContent />
        </Suspense>
    );
}
