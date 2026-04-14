"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { HiOutlineCheck, HiArrowRight, HiOutlineLightningBolt } from "react-icons/hi";
import { apiRequest } from "@/lib/api";

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for small businesses just getting started with email marketing.",
    features: [
      "Up to 3 active campaigns",
      "1,000 contacts",
      "1,000 emails/month",
      "Drag & drop email builder",
      "Basic analytics",
      "Email support",
    ],
    notIncluded: [
      "A/B testing",
      "AI content generation",
      "Priority support",
      "Custom reporting",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 79,
    description: "For growing teams that need more power and AI-driven insights.",
    features: [
      "Up to 15 active campaigns",
      "10,000 contacts",
      "50,000 emails/month",
      "Drag & drop email builder",
      "Advanced analytics",
      "A/B testing",
      "AI content generation",
      "Priority email support",
      "Up to 5 team members",
    ],
    notIncluded: [
      "Custom reporting & export",
      "Dedicated account manager",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    price: 199,
    description: "For enterprises that need unlimited scale and premium features.",
    features: [
      "Unlimited campaigns",
      "100,000 contacts",
      "500,000 emails/month",
      "Drag & drop email builder",
      "Custom analytics & export",
      "A/B testing",
      "AI content generation (Priority)",
      "Dedicated account manager",
      "Unlimited team members",
      "SLA guarantee",
      "Custom integrations",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const { user, token, refreshUser } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const checkout = async (planName: string) => {
    if (!token) return;
    setLoadingPlan(planName);
    try {
      const plan = planName.toLowerCase();
      const data = await apiRequest<{ url: string; mock?: boolean }>(
        "/api/stripe/create-checkout-session",
        { method: "POST", body: JSON.stringify({ plan }) },
        token
      );
      if (data.mock) {
        await refreshUser();
      }
      window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {!user && <Navbar />}

      <section className={`${user ? "" : "pt-32"} pb-24 px-6`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-bg/50 border border-brand-light/30 rounded-full px-4 py-2 mb-6">
              <HiOutlineLightningBolt className="text-brand-dark text-sm" />
              <span className="text-sm font-medium text-brand-dark">Simple, transparent pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Choose your <span className="gradient-text">growth plan</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
              Start free, upgrade when you&apos;re ready. All plans include a 14-day free trial.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !annual ? "bg-white shadow-sm text-brand-dark" : "text-gray-500"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  annual ? "bg-white shadow-sm text-brand-dark" : "text-gray-500"
                }`}
              >
                Annual <span className="text-emerald-500 font-bold">-20%</span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                  plan.popular
                    ? "bg-white border-brand-dark shadow-xl scale-[1.02]"
                    : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-dark text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${annual ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-emerald-500 font-semibold mt-1">
                      Save ${Math.round(plan.price * 0.2 * 12)}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => checkout(plan.name)}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 mb-8 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-brand-dark text-white hover:bg-brand-base shadow-md hover:shadow-lg"
                      : "border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
                  }`}
                >
                  {loadingPlan === plan.name ? "Processing..." : plan.cta} <HiArrowRight />
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-bg/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HiOutlineCheck className="text-brand-dark text-xs" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-40">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-gray-300 text-xs">—</span>
                      </div>
                      <span className="text-sm text-gray-400 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ or trust signals */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-sm">
              All plans include SSL encryption, GDPR compliance, and 24/7 monitoring.{" "}
              {!user && (
                <Link href="/register" className="text-brand-dark font-semibold hover:text-brand-base transition-colors">
                  Start your free trial →
                </Link>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
