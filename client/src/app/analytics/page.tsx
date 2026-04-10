"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  HiOutlineMail,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineBan,
  HiOutlineTrendingUp,
  HiOutlineCalendar,
} from "react-icons/hi";

const overviewStats = [
  { label: "Emails Sent", value: "48,291", icon: HiOutlineMail, trend: "+12.3%", color: "bg-brand-dark" },
  { label: "Open Rate", value: "44.6%", icon: HiOutlineEye, trend: "+2.1%", color: "bg-brand-base" },
  { label: "Click Rate", value: "12.8%", icon: HiOutlineCursorClick, trend: "+3.4%", color: "bg-emerald-500" },
  { label: "Bounce Rate", value: "1.2%", icon: HiOutlineBan, trend: "-0.5%", color: "bg-amber-500" },
];

const campaignPerformance = [
  { name: "Spring Sale", sent: 2450, opens: 1102, clicks: 387, bounces: 12, unsubscribes: 5, openRate: 45.0, clickRate: 15.8 },
  { name: "Newsletter #12", sent: 3100, opens: 1395, clicks: 496, bounces: 18, unsubscribes: 8, openRate: 45.0, clickRate: 16.0 },
  { name: "Product Launch", sent: 890, opens: 423, clicks: 178, bounces: 5, unsubscribes: 2, openRate: 47.5, clickRate: 20.0 },
  { name: "Welcome Flow", sent: 1540, opens: 924, clicks: 462, bounces: 8, unsubscribes: 1, openRate: 60.0, clickRate: 30.0 },
  { name: "Birthday Offer", sent: 680, opens: 340, clicks: 136, bounces: 3, unsubscribes: 0, openRate: 50.0, clickRate: 20.0 },
];

const dailyData = [
  { day: "Mon", sent: 1240, opens: 558 },
  { day: "Tue", sent: 1890, opens: 850 },
  { day: "Wed", sent: 2340, opens: 1053 },
  { day: "Thu", sent: 1680, opens: 756 },
  { day: "Fri", sent: 2100, opens: 945 },
  { day: "Sat", sent: 890, opens: 400 },
  { day: "Sun", sent: 650, opens: 292 },
];

const maxSent = Math.max(...dailyData.map((d) => d.sent));

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Track your email marketing performance.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
            <HiOutlineCalendar className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Last 30 days</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="card !p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="text-white text-xl" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <HiOutlineTrendingUp className="text-sm" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Send Volume</h3>
            <div className="flex items-end gap-3 h-48">
              {dailyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1" style={{ height: "160px" }}>
                    <div
                      className="w-full bg-brand-base/20 rounded-t-lg relative group transition-all hover:bg-brand-base/30"
                      style={{ height: `${(d.sent / maxSent) * 100}%`, marginTop: "auto" }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-brand-dark rounded-t-lg transition-all"
                        style={{ height: `${(d.opens / d.sent) * 100}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <p>Sent: {d.sent.toLocaleString()}</p>
                        <p>Opens: {d.opens.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-brand-base/30" />
                <span className="text-xs text-gray-400">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-brand-dark" />
                <span className="text-xs text-gray-400">Opened</span>
              </div>
            </div>
          </div>

          {/* Top metrics */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Engagement Funnel</h3>
            <div className="space-y-4">
              {[
                { label: "Delivered", value: "47,712", pct: 98.8, color: "bg-brand-dark" },
                { label: "Opened", value: "21,523", pct: 44.6, color: "bg-brand-base" },
                { label: "Clicked", value: "6,172", pct: 12.8, color: "bg-brand-light" },
                { label: "Converted", value: "1,234", pct: 2.6, color: "bg-brand-bg" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="card !p-0 overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Campaign Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Campaign</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Sent</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Opens</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Open Rate</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Clicks</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Click Rate</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Bounces</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Unsubs</th>
                </tr>
              </thead>
              <tbody>
                {campaignPerformance.map((c) => (
                  <tr key={c.name} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{c.sent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{c.opens.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-emerald-600">{c.openRate}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{c.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-brand-dark">{c.clickRate}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{c.bounces}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{c.unsubscribes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
