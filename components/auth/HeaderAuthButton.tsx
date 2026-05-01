"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import AuthModal from "@/components/auth/AuthModal";
import { logout, subscribeToAuthChanges } from "@/lib/auth";

interface Props {
  className?: string;
}

export default function HeaderAuthButton({ className = "right-4 top-4 md:right-8 md:top-8" }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    return subscribeToAuthChanges(setUser);
  }, []);

  return (
    <>
      <div className={`fixed z-50 flex items-center gap-2 ${className}`}>
        {user ? (
          <>
            <span className="hidden max-w-[160px] truncate text-xs font-bold text-white/45 sm:block">
              {user.email || user.displayName || "로그인됨"}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-extrabold text-white/75 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-extrabold text-white/75 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
          >
            로그인 / 회원가입
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(nextUser) => setUser(nextUser)}
      />
    </>
  );
}
