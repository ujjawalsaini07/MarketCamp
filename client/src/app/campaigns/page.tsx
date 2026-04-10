"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import Link from "next/link";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineDotsVertical,
  HiOutlineMail,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlinePlay,
} from "react-icons/hi";

type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "COMPLETED";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  { id: "1", name: "Spring Sale Announcement", subject: "🌸 Spring Sale — Up to 50% Off!", status: "COMPLETED", sentCount: 2450, openCount: 1102, clickCount: 387, createdAt: "2026-04-08" },
  { id: "2", name: "Weekly Newsletter #12", subject: "This Week in Marketing", status: "COMPLETED", sentCount: 3100, openCount: 1395, clickCount: 496, createdAt: "2026-04-05" },
  { id: "3", name: "Product Launch Teaser", subject: "Something big is coming...", status: "SENDING", sentCount: 890, openCount: 0, clickCount: 0, createdAt: "2026-04-10" },
  { id: "4", name: "Re-engagement Series", subject: "We miss you! Here's 20% off", status: "DRAFT", sentCount: 0, openCount: 0, clickCount: 0, createdAt: "2026-04-10" },
  { id: "5", name: "Welcome Email Flow", subject: "Welcome to the family!", status: "SCHEDULED", sentCount: 0, openCount: 0, clickCount: 0, createdAt: "2026-04-09" },
];

const statusStyles: Record<CampaignStatus, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  SENDING: "bg-blue-50 text-blue-600 border-blue-100",
  DRAFT: "bg-gray-50 text-gray-500 border-gray-100",
  SCHEDULED: "bg-amber-50 text-amber-600 border-amber-100",
};

const statusFilters: CampaignStatus[] = ["DRAFT", "SCHEDULED", "SENDING", "COMPLETED"];

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = mockCampaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "ALL" || c.status === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Campaigns</h1>
            <p className="text-gray-500 mt-1">Manage and monitor your email campaigns.</p>
          </div>
          <Link href="/email-builder" className="btn-primary flex items-center gap-2 text-sm">
            <HiOutlinePlus className="text-lg" />
            Create Campaign
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-base/40 focus:border-brand-base transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === "ALL" ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === s ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign Cards */}
        <div className="space-y-4">
          {filtered.map((campaign) => (
            <div key={campaign.id} className="card !p-0 overflow-hidden">
              <div className="flex items-center p-5 gap-5">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-brand-bg/50 flex items-center justify-center flex-shrink-0">
                  <HiOutlineMail className="text-xl text-brand-dark" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{campaign.name}</h3>
                    <span className={`text-xs font-semibold px-3 py-0.5 rounded-full border ${statusStyles[campaign.status]}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{campaign.subject}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <HiOutlineMail className="text-sm" />
                      <span className="text-xs font-medium">Sent</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{campaign.sentCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <HiOutlineEye className="text-sm" />
                      <span className="text-xs font-medium">Opened</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{campaign.openCount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      <HiOutlineCursorClick className="text-sm" />
                      <span className="text-xs font-medium">Clicked</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{campaign.clickCount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === campaign.id ? null : campaign.id)}
                    className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <HiOutlineDotsVertical className="text-gray-400" />
                  </button>
                  {menuOpen === campaign.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <HiOutlinePencil className="text-gray-400" /> Edit
                      </button>
                      {campaign.status === "DRAFT" && (
                        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-brand-dark hover:bg-brand-bg/30 transition-colors">
                          <HiOutlinePlay className="text-brand-dark" /> Send Now
                        </button>
                      )}
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <HiOutlineTrash className="text-red-400" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <HiOutlineMail className="text-5xl text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No campaigns found</p>
              <p className="text-sm text-gray-300 mt-1">Try adjusting your filters or create a new campaign</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
