"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { HiOutlineSearch, HiOutlineMail, HiOutlineEye, HiOutlineCursorClick, HiOutlineTrash, HiOutlinePlay } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "COMPLETED";
interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  sentCount: number;
  openCount: number;
  clickCount: number;
}
interface Template {
  id: string;
  name: string;
}
interface Audience {
  id: string;
  name: string;
}
interface RecipientStatus {
  contactId: string;
  email: string;
  name: string | null;
  status: "PENDING" | "SENT" | "OPENED" | "CLICKED" | "UNSUBSCRIBED";
  pageVisits: number;
}

const statusStyles: Record<CampaignStatus, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  SENDING: "bg-blue-50 text-blue-600 border-blue-100",
  DRAFT: "bg-gray-50 text-gray-500 border-gray-100",
  SCHEDULED: "bg-amber-50 text-amber-600 border-amber-100",
};

const statusFilters: CampaignStatus[] = ["DRAFT", "SCHEDULED", "SENDING", "COMPLETED"];

export default function CampaignsPage() {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [audienceId, setAudienceId] = useState("");
  const [csvData, setCsvData] = useState("email,name\njohn@example.com,John Doe");
  const [audienceName, setAudienceName] = useState("Imported Contacts");
  const [message, setMessage] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<RecipientStatus[]>([]);

  const load = async () => {
    if (!token) return;
    const [campaignData, templateData, audienceData] = await Promise.all([
      apiRequest<{ campaigns: Campaign[] }>("/api/campaigns", {}, token),
      apiRequest<{ templates: Template[] }>("/api/templates", {}, token),
      apiRequest<{ audiences: Audience[] }>("/api/audiences", {}, token),
    ]);
    setCampaigns(campaignData.campaigns);
    setTemplates(templateData.templates);
    setAudiences(audienceData.audiences);
  };

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [token]);

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "ALL" || c.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const createCampaign = async () => {
    if (!token || !name || !subject || !templateId || !audienceId) return;
    try {
      await apiRequest(
        "/api/campaigns",
        {
          method: "POST",
          body: JSON.stringify({ name, subject, templateId, audienceIds: [audienceId] }),
        },
        token
      );
      setName("");
      setSubject("");
      setMessage("Campaign created");
      await load();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const sendCampaign = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`/api/campaigns/${id}/send`, { method: "POST" }, token);
      setMessage("Campaign sent");
      await load();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`/api/campaigns/${id}`, { method: "DELETE" }, token);
      await load();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const loadRecipients = async (campaignId: string) => {
    if (!token) return;
    try {
      const data = await apiRequest<{ recipients: RecipientStatus[] }>(
        `/api/track/analytics/${campaignId}/recipients`,
        {},
        token
      );
      setSelectedCampaignId(campaignId);
      setRecipients(data.recipients);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const importContacts = async () => {
    if (!token) return;
    try {
      await apiRequest("/api/contacts/import", { method: "POST", body: JSON.stringify({ csvData }) }, token);
      const contactsRes = await apiRequest<{ contacts: { id: string }[] }>("/api/contacts", {}, token);
      const contactIds = contactsRes.contacts.map((c) => c.id);
      await apiRequest("/api/audiences", { method: "POST", body: JSON.stringify({ name: audienceName, contactIds }) }, token);
      await load();
      setMessage("Contacts imported and audience created");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Campaigns</h1>
            <p className="text-gray-500 mt-1">Manage and monitor your email campaigns.</p>
          </div>
          <span className="text-sm text-brand-dark">{message}</span>
        </div>

        <div className="card mb-6 grid md:grid-cols-2 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" className="px-3 py-2 rounded-lg border" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" className="px-3 py-2 rounded-lg border" />
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="px-3 py-2 rounded-lg border">
            <option value="">Select template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select value={audienceId} onChange={(e) => setAudienceId(e.target.value)} className="px-3 py-2 rounded-lg border">
            <option value="">Select audience</option>
            {audiences.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button onClick={createCampaign} className="btn-primary">Create Campaign</button>
        </div>

        <div className="card mb-6">
          <p className="font-semibold mb-2">Bulk import contacts (CSV)</p>
          <input value={audienceName} onChange={(e) => setAudienceName(e.target.value)} placeholder="Audience name" className="px-3 py-2 rounded-lg border mb-3 w-full" />
          <textarea value={csvData} onChange={(e) => setCsvData(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg border font-mono text-xs" />
          <button onClick={importContacts} className="btn-primary mt-3">Import and Create Audience</button>
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadRecipients(campaign.id)}
                    className="px-3 py-2 rounded-lg border text-xs text-gray-700"
                  >
                    Monitor
                  </button>
                  {campaign.status === "DRAFT" && (
                    <button onClick={() => sendCampaign(campaign.id)} className="px-3 py-2 rounded-lg bg-brand-dark text-white text-xs flex items-center gap-1">
                      <HiOutlinePlay /> Send
                    </button>
                  )}
                  <button onClick={() => deleteCampaign(campaign.id)} className="px-3 py-2 rounded-lg border text-xs text-red-500 flex items-center gap-1">
                    <HiOutlineTrash /> Delete
                  </button>
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
        {selectedCampaignId ? (
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recipient status monitor</h3>
              <span className="text-xs text-gray-500">{selectedCampaignId}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Page Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((r) => (
                    <tr key={r.contactId} className="border-b">
                      <td className="py-2">{r.email}</td>
                      <td className="py-2 font-medium">{r.status}</td>
                      <td className="py-2 text-right">{r.pageVisits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
