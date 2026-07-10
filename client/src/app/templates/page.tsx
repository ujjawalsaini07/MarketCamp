"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import Link from "next/link";
import { HiOutlineTemplate, HiOutlineTrash, HiOutlinePencilAlt, HiOutlinePlus, HiOutlineSearch } from "react-icons/hi";

interface Template {
  id: string;
  name: string;
  htmlContent: string;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const loadTemplates = async () => {
    if (!token) return;
    try {
      const data = await apiRequest<{ templates: Template[] }>("/api/templates", {}, token);
      setTemplates(data.templates);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [token]);

  const deleteTemplate = async (id: string) => {
    if (!token) return;
    try {
      await apiRequest(`/api/templates/${id}`, { method: "DELETE" }, token);
      await loadTemplates();
      setMessage("Template deleted successfully.");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Templates</h1>
            <p className="text-gray-500 mt-1">Manage your email templates.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-brand-dark">{message}</span>
            <Link href="/email-builder" className="btn-primary flex items-center gap-2 text-sm">
              <HiOutlinePlus className="text-lg" /> Create Template
            </Link>
          </div>
        </div>

        <div className="relative max-w-md mb-8">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-base/40 focus:border-brand-base transition-all"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full card text-center py-16">
              <HiOutlineTemplate className="text-5xl text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No templates found.</p>
              <p className="text-sm text-gray-400">Create a new template to get started.</p>
            </div>
          ) : (
            filtered.map((template) => (
              <div key={template.id} className="card !p-0 overflow-hidden flex flex-col group">
                <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-white">
                     <div 
                       className="w-[1200px] h-[1200px] origin-top-left scale-[0.3] transform"
                       dangerouslySetInnerHTML={{ __html: template.htmlContent || '' }}
                     />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent z-10" />
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3">
                     <Link href={`/email-builder?id=${template.id}`} className="p-3 bg-white text-brand-dark rounded-full hover:scale-110 transition-transform shadow-lg">
                        <HiOutlinePencilAlt className="text-xl" />
                     </Link>
                     <button onClick={() => deleteTemplate(template.id)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                        <HiOutlineTrash className="text-xl" />
                     </button>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{template.name}</h3>
                    <p className="text-xs text-gray-400">Last updated {new Date(template.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
