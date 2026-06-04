"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoginForm } from "./LoginForm";
import { AuthRegisterContent } from "./AuthRegisterContent";
import { AuthTabs } from "./AuthTabs";
import type { ReactNode } from "react";

function SlidePanel({ children }: { children: ReactNode; key: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export function AuthContainer() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    // Quitamos el max-w-[600px] de aquí y dejamos solo w-full
    <motion.div
      className="w-full flex flex-col gap-6"
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
  );
}
