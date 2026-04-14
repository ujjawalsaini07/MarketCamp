"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HiOutlineMail,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineUserGroup,
  HiArrowRight,
  HiOutlinePlus,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
} from "react-icons/hi";
import { apiRequest } from "@/lib/api";

interface Overview {
  totalCampaigns: number;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  totalContacts: number;
  avgOpenRate: string;
}

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  SENDING: "bg-blue-50 text-blue-600 border-blue-100",
  DRAFT: "bg-gray-50 text-gray-500 border-gray-100",
  SCHEDULED: "bg-amber-50 text-amber-600 border-amber-100",
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiRequest<Overview>("/api/track/analytics/overview", {}, token),
      apiRequest<{ campaigns: any[] }>("/api/campaigns", {}, token),
    ])
      .then(([ov, camps]) => {
        setOverview(ov);
        setRecentCampaigns(camps.campaigns.slice(0, 5));
      })
      .catch(() => undefined);
  }, [token]);

  const statsCards = [
    { title: "Total Campaigns", value: String(overview?.totalCampaigns || 0), change: "Live", trend: "up", icon: HiOutlineMail, color: "bg-brand-dark" },
    { title: "Emails Sent", value: (overview?.totalSent || 0).toLocaleString(), change: "Live", trend: "up", icon: HiOutlineEye, color: "bg-brand-base" },
    { title: "Avg. Open Rate", value: `${overview?.avgOpenRate || "0"}%`, change: "Live", trend: "up", icon: HiOutlineCursorClick, color: "bg-emerald-500" },
    { title: "Total Contacts", value: (overview?.totalContacts || 0).toLocaleString(), change: "Live", trend: "up", icon: HiOutlineUserGroup, color: "bg-amber-500" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Welcome back, <span className="gradient-text">{user?.name || "there"}</span>
            </h1>
            <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your campaigns today.</p>
          </div>
          <Link
            href="/campaigns"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <HiOutlinePlus className="text-lg" />
            New Campaign
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.title} className="card !p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="text-white text-xl" />
                </div>
                {stat.trend === "up" ? (
                  <HiOutlineTrendingUp className="text-emerald-500 text-xl" />
                ) : (
                  <HiOutlineTrendingDown className="text-red-400 text-xl" />
                )}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{stat.title}</p>
              <p className="text-xs text-emerald-500 mt-2 font-semibold">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Campaigns */}
          <div className="lg:col-span-2 card !p-0">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Campaigns</h2>
              <Link href="/campaigns" className="text-sm font-semibold text-brand-dark hover:text-brand-base flex items-center gap-1 transition-colors">
                View All <HiArrowRight className="text-xs" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Campaign</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Sent</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Opened</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((c) => (
                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{c.name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyles[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.sentCount?.toLocaleString?.() ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{c.openCount?.toLocaleString?.() ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-5">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/email-builder"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg/30 hover:bg-brand-bg/60 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-dark flex items-center justify-center">
                    <HiOutlinePlus className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Create Email</p>
                    <p className="text-xs text-gray-400">Design a new template</p>
                  </div>
                  <HiArrowRight className="text-gray-300 group-hover:text-brand-dark transition-colors" />
                </Link>
                <Link
                  href="/campaigns"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg/30 hover:bg-brand-bg/60 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-base flex items-center justify-center">
                    <HiOutlineMail className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">New Campaign</p>
                    <p className="text-xs text-gray-400">Launch a new campaign</p>
                  </div>
                  <HiArrowRight className="text-gray-300 group-hover:text-brand-dark transition-colors" />
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg/30 hover:bg-brand-bg/60 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <HiOutlineTrendingUp className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">View Analytics</p>
                    <p className="text-xs text-gray-400">Check performance</p>
                  </div>
                  <HiArrowRight className="text-gray-300 group-hover:text-brand-dark transition-colors" />
                </Link>
              </div>
            </div>

            {/* Plan info */}
            <div className="card !bg-gradient-to-br !from-[#1a2e1c] !to-[#346739] !border-0">
              <p className="text-brand-light text-xs font-semibold uppercase tracking-wider">Current Plan</p>
              <p className="text-white text-2xl font-extrabold mt-2">{user?.plan || "Starter"}</p>
              <p className="text-white/60 text-sm mt-1">
                {user?.plan === "Starter" ? "1,000 emails/mo" : user?.plan === "Pro" ? "10,000 emails/mo" : "100,000 emails/mo"}
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1 text-brand-light text-sm font-semibold hover:text-white transition-colors"
              >
                Upgrade Plan <HiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
