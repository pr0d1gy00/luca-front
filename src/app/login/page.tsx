"use client";
import { PharmiWorkspace, AuthContainer } from "@/components/pharmako-login";

export default function PharmakoLoginPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row">
      <div className="lg:w-1/2 lg:h-screen lg:sticky lg:top-0 max-h-[40vh] lg:max-h-none overflow-hidden">
        <PharmiWorkspace />
      </div>
      <div className="lg:w-1/2 lg:h-screen lg:overflow-y-auto">
        <AuthContainer />
      </div>
    </div>
  );
}
