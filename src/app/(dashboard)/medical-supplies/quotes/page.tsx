import { QuoteForm } from "@/features/medical-supplies/components";

export const metadata = {
  title: "Quotes Inbox - Medical Supplies - LUCA",
  description: "Manage and create quotes for medical supply orders.",
};

export default function MedicalSuppliesQuotesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Quotes Inbox
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-lg text-slate-900 mb-2">
              Pending Requests
            </h3>
            <p className="text-sm text-slate-500">
              Select a request from clinics or patients to build a quote.
            </p>
            {/* List of pending requests would go here */}
            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:border-teal-600 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-slate-900">Order #1023</span>
                <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Requested by: Clinica San Jose
              </p>
            </div>
          </div>
        </div>
        <div>
          {/* Quote builder form */}
          <QuoteForm orderId={1023} />
        </div>
      </div>
    </div>
  );
}
