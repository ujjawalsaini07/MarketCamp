"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { HiOutlineUserGroup, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineSave } from "react-icons/hi";

interface Contact {
  id: string;
  email: string;
  name: string | null;
  unsubscribed: boolean;
}

interface Audience {
  id: string;
  name: string;
  contacts: Contact[];
  createdAt: string;
}

const AudienceRow = ({ audience, deleteAudience, loadAudiences, token }: any) => {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const filtered = audience.contacts.filter((c: any) => 
    c.email.toLowerCase().includes(search.toLowerCase()) || 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
  );

  const startEdit = (c: any) => {
    setEditId(c.id);
    setEditName(c.name || "");
    setEditEmail(c.email);
  };

  const saveEdit = async () => {
    try {
      await apiRequest(`/api/contacts/${editId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName, email: editEmail })
      }, token);
      setEditId(null);
      await loadAudiences();
    } catch(e) {
      // Ignore error
    }
  };

  return (
    <div className="card !p-0 overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-dark flex items-center justify-center">
              <HiOutlineUserGroup className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{audience.name}</h3>
              <p className="text-sm text-gray-500">{audience.contacts.length} contacts • Created {new Date(audience.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        <button 
          onClick={() => deleteAudience(audience.id)}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <HiOutlineTrash />
          Delete Audience
        </button>
      </div>
      
      {audience.contacts.length > 0 && (
        <>
          <div className="px-6 py-3 border-b border-gray-50 bg-white">
            <div className="relative max-w-sm">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                placeholder="Search contacts..." 
                value={search} 
                onChange={e=>setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-base/40" 
              />
            </div>
          </div>
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status / Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact: any) => (
                  <tr key={contact.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-6">
                      {editId === contact.id ? (
                        <input className="border border-brand-base px-2 py-1 rounded text-sm w-full" value={editEmail} onChange={e=>setEditEmail(e.target.value)} />
                      ) : (
                        <span className="text-gray-900 font-medium">{contact.email}</span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      {editId === contact.id ? (
                        <input className="border border-brand-base px-2 py-1 rounded text-sm w-full" value={editName} onChange={e=>setEditName(e.target.value)} />
                      ) : (
                        <span className="text-gray-600">{contact.name || "-"}</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {contact.unsubscribed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Unsubbed</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                        )}
                        {editId === contact.id ? (
                           <button onClick={saveEdit} className="text-brand-dark hover:bg-brand-bg p-1.5 rounded-lg transition-colors"><HiOutlineSave className="text-lg" /></button>
                        ) : (
                           <button onClick={() => startEdit(contact)} className="text-gray-400 hover:text-brand-base hover:bg-brand-bg/50 p-1.5 rounded-lg transition-colors"><HiOutlinePencil className="text-lg" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-gray-400">No contacts match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default function ContactsPage() {
  const { token } = useAuth();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [message, setMessage] = useState("");
  
  const [csvData, setCsvData] = useState("email,name\njohn@example.com,John Doe");
  const [audienceName, setAudienceName] = useState("Imported Contacts");

  const loadAudiences = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ audiences: Audience[] }>("/api/audiences", {}, token);
      setAudiences(data.audiences);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadAudiences();
  }, [token]);

  const importContacts = async () => {
    if (!token) return;
    try {
      setMessage("Importing contacts...");
      const importRes = await apiRequest<{ contactIds: string[] }>("/api/contacts/import", { method: "POST", body: JSON.stringify({ csvData }), showProgress: true }, token);
      await apiRequest("/api/audiences", { method: "POST", body: JSON.stringify({ name: audienceName, contactIds: importRes.contactIds }) }, token);
      await loadAudiences();
      setMessage("Contacts imported and audience created");
      setCsvData("email,name\n");
      setAudienceName("");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const deleteAudience = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`/api/audiences/${id}`, { method: "DELETE" }, token);
      await loadAudiences();
      setMessage("Audience deleted");
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
            <h1 className="text-3xl font-extrabold text-gray-900">Contacts & Audiences</h1>
            <p className="text-gray-500 mt-1">Manage your subscribers and segments.</p>
          </div>
          <span className="text-sm font-medium text-brand-dark">{message}</span>
        </div>

        {/* Import Section */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-bg/50 flex items-center justify-center">
              <HiOutlinePlus className="text-xl text-brand-dark" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import Contacts</h2>
              <p className="text-sm text-gray-400">Add bulk contacts via CSV.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Audience Name</label>
              <input 
                value={audienceName} 
                onChange={(e) => setAudienceName(e.target.value)} 
                placeholder="e.g. Q4 Newsletter" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-base/40" 
              />
              <button 
                onClick={importContacts} 
                disabled={!audienceName || !csvData}
                className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import & Create Audience
              </button>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">CSV Data (email,name)</label>
              <textarea 
                value={csvData} 
                onChange={(e) => setCsvData(e.target.value)} 
                rows={5} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-base/40" 
              />
            </div>
          </div>
        </div>

        {/* Audiences List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Your Audiences</h2>
            <div className="relative max-w-xs w-full">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                placeholder="Search audiences..." 
                value={audienceSearch} 
                onChange={e=>setAudienceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-base/40" 
              />
            </div>
          </div>
          
          {audiences.length === 0 ? (
            <div className="card text-center py-12">
              <HiOutlineUserGroup className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No audiences found.</p>
              <p className="text-sm text-gray-400">Import contacts to create your first audience.</p>
            </div>
          ) : (
            audiences
              .filter(a => a.name.toLowerCase().includes(audienceSearch.toLowerCase()))
              .map((audience) => (
                 <AudienceRow 
                    key={audience.id} 
                    audience={audience} 
                    deleteAudience={deleteAudience} 
                    loadAudiences={loadAudiences} 
                    token={token} 
                 />
              ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
