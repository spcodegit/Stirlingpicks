'use client';

import { useAuth } from "../../context/AuthContext";
import Login from "./Login";
import Signup from "./Signup";
import VerifyEmailModal from "./VerifyEmailModal";

export default function AuthModal() {
    const { isLoginModalOpen, isSignupModalOpen, isVerifyModalOpen } = useAuth();

    if (isLoginModalOpen) return <Login />;
    if (isSignupModalOpen) return <Signup />;
    if (isVerifyModalOpen) return <VerifyEmailModal />;

    return null;
}
