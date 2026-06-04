"use client";
import { PharmiWorkspace, AuthContainer } from "@/components/pharmako-login";

export default function PharmakoLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 h-screen">
        <PharmiWorkspace />
      </div>
      <div className="w-full lg:w-1/2 h-screen">
        <AuthContainer />
      </div>
    </div>
  );
}
