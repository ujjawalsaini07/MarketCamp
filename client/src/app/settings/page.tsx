"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  HiOutlineMail,
  HiOutlineGlobe,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineSave,
} from "react-icons/hi";

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [emailServiceUrl, setEmailServiceUrl] = useState("https://your-emailvercel.vercel.app");
  const [fromName, setFromName] = useState("CampaignIQ");
  const [fromEmail, setFromEmail] = useState(user?.email || "");
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [notifyOnBounce, setNotifyOnBounce] = useState(true);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(false);
  const [saved, setSaved] = useState(false);
  const [billingPlan, setBillingPlan] = useState(user?.plan || "Starter");

  useEffect(() => {
    if (!token) return;
    apiRequest<{ plan: string }>("/api/stripe/billing", {}, token)
      .then((data) => setBillingPlan(data.plan))
      .catch(() => undefined);
  }, [token]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your CampaignIQ workspace.</p>
        </div>

        <div className="space-y-6">
          {/* Email Configuration */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center">
                <HiOutlineMail className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Email Configuration</h2>
                <p className="text-sm text-gray-400">Configure your email sending settings.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Service URL</label>
                <input
                  type="url"
                  value={emailServiceUrl}
                  onChange={(e) => setEmailServiceUrl(e.target.value)}
                  placeholder="https://your-email-api.vercel.app"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-base/40 focus:border-brand-base transition-all"
                />
                <p className="text-xs text-gray-400 mt-1.5">Your deployed emailvercel instance URL</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-base/40 focus:border-brand-base transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-base/40 focus:border-brand-base transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-base flex items-center justify-center">
                <HiOutlineGlobe className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">API Keys</h2>
                <p className="text-sm text-gray-400">Current plan: {billingPlan}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stripe Secret Key</label>
                <input
                  type="password"
                  value="sk_test_••••••••••••••••"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1.5">Configured via environment variables</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <HiOutlineBell className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-400">Choose what alerts you receive.</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Campaign Completed", desc: "Get notified when a campaign finishes sending.", value: notifyOnComplete, setter: setNotifyOnComplete },
                { label: "Bounce Alerts", desc: "Alert when bounce rate exceeds 5%.", value: notifyOnBounce, setter: setNotifyOnBounce },
                { label: "Weekly Reports", desc: "Receive a weekly performance summary email.", value: notifyWeeklyReport, setter: setNotifyWeeklyReport },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.setter(!item.value)}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                      item.value ? "bg-brand-dark" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        item.value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card !border-red-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
                <HiOutlineShieldCheck className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Danger Zone</h2>
                <p className="text-sm text-gray-400">Irreversible actions.</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 border border-red-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">Delete Account</p>
                <p className="text-xs text-gray-400">Permanently deletes your account and all data.</p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <HiOutlineSave className="text-lg" />
              {saved ? "Saved ✓" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
