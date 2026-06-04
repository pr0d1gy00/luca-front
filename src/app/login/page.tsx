"use client";
import { PharmiWorkspace, AuthContainer } from "@/components/pharmako-login";

export default function PharmakoLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      <div className="hidden lg:block w-full lg:w-1/2 h-screen sticky top-0">
        <PharmiWorkspace />
      </div>
      <div className="w-full lg:w-1/2 lg:h-screen overflow-y-auto">
        <div
          className="lg:hidden flex items-center gap-2 px-6 py-5 border-b"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#0057FF" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z"
                fill="white"
              />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-semibold" style={{ color: "#0F172A" }}>
            Pharmako
          </span>
        </div>
        <AuthContainer />
      </div>
    </div>
  );
}
