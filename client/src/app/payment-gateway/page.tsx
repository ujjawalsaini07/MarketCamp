"use client";

import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PaymentGatewayContent() {
  const params = useSearchParams();
  const mode = params.get("mode") || "mock";
  const plan = params.get("plan") || "starter";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto card">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Payment Gateway</h1>
        <p className="text-gray-600 mb-4">
          {mode === "mock"
            ? `Mock payment completed successfully for ${plan.toUpperCase()} plan.`
            : "Payment session created."}
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/pricing" className="btn-secondary">
            Back to Pricing
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading payment...</div>}>
      <PaymentGatewayContent />
    </Suspense>
  );
}
