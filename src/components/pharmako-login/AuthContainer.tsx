"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoginForm } from "./LoginForm";
import { AuthRegisterContent } from "./AuthRegisterContent";
import { AuthTabs } from "./AuthTabs";
import type { ReactNode } from "react";

function SlidePanel({
  children,
  key: panelKey,
}: {
  children: ReactNode;
  key: string;
}) {
  return (
    <motion.div
      key={panelKey}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AuthContainer() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="h-screen flex items-center justify-center px-8 lg:px-16 bg-pharmako-surface">
      <motion.div
        className="w-full max-w-lg space-y-6"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AuthTabs active={tab} onSelect={setTab} />

        <AnimatePresence mode="wait">
          {tab === "login" ? (
            <SlidePanel key="login">
              <LoginForm />
            </SlidePanel>
          ) : (
            <SlidePanel key="register">
              <AuthRegisterContent />
            </SlidePanel>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
