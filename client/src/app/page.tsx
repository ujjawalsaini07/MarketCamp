"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  HiOutlineMail,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineTemplate,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiArrowRight,
  HiOutlineCheck,
} from "react-icons/hi";

const features = [
  {
    icon: HiOutlineMail,
    title: "Smart Email Campaigns",
    description:
      "Create, schedule, and send beautiful email campaigns to segmented audiences with powerful automation.",
  },
  {
    icon: HiOutlineTemplate,
    title: "Drag & Drop Builder",
    description:
      "Design stunning emails with our intuitive drag-and-drop editor. No coding required — just drag, drop, and send.",
  },
  {
    icon: HiOutlineChartBar,
    title: "Real-Time Analytics",
    description:
      "Track opens, clicks, bounces, and conversions in real-time with beautiful interactive dashboards.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Audience Segmentation",
    description:
      "Import contacts via CSV, create smart segments, and target the right people with the right message.",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "AI-Powered Content",
    description:
      "Let AI generate subject lines, email copy, and optimal send times to maximize your engagement rates.",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Compliance Built-In",
    description:
      "Automatic unsubscribe management and CAN-SPAM/GDPR compliance tools keep your campaigns legal.",
  },
];

const steps = [
  {
    num: "01",
    title: "Build Your Audience",
    description: "Import contacts via CSV or add them manually. Create smart segments based on attributes.",
  },
  {
    num: "02",
    title: "Design Your Email",
    description: "Use our drag-and-drop builder or choose from professional templates to craft your message.",
  },
  {
    num: "03",
    title: "Launch & Track",
    description: "Schedule or send immediately. Watch real-time analytics as opens and clicks roll in.",
  },
];

const stats = [
  { value: "99.5%", label: "Delivery Rate" },
  { value: "10M+", label: "Emails Sent" },
  { value: "45%", label: "Avg. Open Rate" },
  { value: "5x", label: "ROI Increase" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-light/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-bg/40 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/4 w-4 h-4 bg-brand-base rounded-full animate-float" />
        <div className="absolute top-60 right-1/3 w-3 h-3 bg-brand-dark rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-1/3 w-5 h-5 bg-brand-bg rounded-full animate-float" style={{ animationDelay: "2s" }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-bg/50 border border-brand-light/30 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-brand-base animate-pulse" />
              <span className="text-sm font-medium text-brand-dark">
                Now in Public Beta — Start for Free
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Email Marketing
              <br />
              <span className="gradient-text">Made Intelligent</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Plan, build, send, and analyze your email campaigns from one
              beautiful platform. Powered by AI. Built for results.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/register" className="btn-primary flex items-center gap-2 text-base !px-8 !py-4">
                Start Free Trial
                <HiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="#features" className="btn-secondary text-base !px-8 !py-4">
                See Features
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 relative animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 max-w-5xl mx-auto overflow-hidden">
              <div className="bg-gradient-to-br from-[#1a2e1c] to-[#346739] rounded-2xl p-8 min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                    <p className="text-brand-light text-xs font-semibold uppercase tracking-wider">Sent</p>
                    <p className="text-white text-2xl font-bold mt-2">12,847</p>
                    <div className="mt-3 h-1 bg-white/10 rounded">
                      <div className="h-full w-4/5 bg-brand-light rounded" />
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                    <p className="text-brand-light text-xs font-semibold uppercase tracking-wider">Opened</p>
                    <p className="text-white text-2xl font-bold mt-2">5,721</p>
                    <div className="mt-3 h-1 bg-white/10 rounded">
                      <div className="h-full w-3/5 bg-brand-base rounded" />
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-5">
                    <p className="text-brand-light text-xs font-semibold uppercase tracking-wider">Clicked</p>
                    <p className="text-white text-2xl font-bold mt-2">2,103</p>
                    <div className="mt-3 h-1 bg-white/10 rounded">
                      <div className="h-full w-2/5 bg-brand-bg rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-brand-dark/10 rounded-full blur-xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-base uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Everything you need to
              <br />
              <span className="gradient-text">crush email marketing</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From drag-and-drop design to AI-powered insights — all the tools a modern marketer needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature) => (
              <div key={feature.title} className="card group opacity-0 animate-fade-in-up">
                <div className="w-12 h-12 rounded-xl bg-brand-bg/50 flex items-center justify-center mb-5 group-hover:bg-brand-light/30 transition-colors">
                  <feature.icon className="text-2xl text-brand-dark" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-brand-bg/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-base uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Three steps to <span className="gradient-text">campaign success</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="text-6xl font-black text-brand-light/30 mb-4">{step.num}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 w-8 text-brand-light/40">
                    <HiArrowRight className="text-2xl" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-bg rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                Ready to launch smarter campaigns?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of marketers who trust CampaignIQ to deliver results. Start free, upgrade anytime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="bg-white text-brand-dark font-bold px-8 py-4 rounded-xl hover:bg-brand-bg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Get Started Free
                  <HiArrowRight />
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 text-white/70 text-sm">
                <span className="flex items-center gap-1"><HiOutlineCheck /> No credit card required</span>
                <span className="flex items-center gap-1"><HiOutlineCheck /> 14-day free trial</span>
                <span className="flex items-center gap-1"><HiOutlineCheck /> Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-brand-dark">
              Campaign<span className="text-brand-base">IQ</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CampaignIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-brand-dark transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-dark transition-colors">Terms</Link>
            <Link href="#" className="hover:text-brand-dark transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
