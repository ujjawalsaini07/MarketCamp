"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import {
  HiOutlineSave,
  HiOutlineEye,
  HiOutlinePhotograph,
  HiOutlineCode,
  HiOutlineTemplate,
  HiOutlinePencilAlt,
} from "react-icons/hi";

const blockTypes = [
  { id: "heading", label: "Heading", icon: "H1" },
  { id: "text", label: "Text Block", icon: "T" },
  { id: "image", label: "Image", icon: "🖼" },
  { id: "button", label: "Button", icon: "▶" },
  { id: "divider", label: "Divider", icon: "—" },
  { id: "spacer", label: "Spacer", icon: "↕" },
  { id: "columns", label: "2 Columns", icon: "⊞" },
];

interface Block {
  id: string;
  type: string;
  content: string;
  props?: Record<string, string>;
}

const defaultBlocks: Block[] = [
  { id: "1", type: "heading", content: "Welcome to Our Newsletter", props: { align: "center", color: "#346739" } },
  { id: "2", type: "text", content: "Hi there! Thanks for subscribing. We're excited to share the latest updates, tips, and exclusive offers with you." },
  { id: "3", type: "image", content: "https://via.placeholder.com/600x200/9FCB98/346739?text=Your+Banner+Here" },
  { id: "4", type: "text", content: "Our team has been working on some amazing things. Stay tuned for exciting announcements coming your way!" },
  { id: "5", type: "button", content: "Shop Now", props: { url: "https://example.com", bgColor: "#346739", color: "#ffffff" } },
  { id: "6", type: "divider", content: "" },
  { id: "7", type: "text", content: "If you have any questions, reply to this email. We'd love to hear from you!" },
];

export default function EmailBuilderPage() {
  const { token } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "code">("edit");
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === "heading" ? "New Heading" : type === "text" ? "Edit this text..." : type === "button" ? "Click Me" : type === "image" ? "https://via.placeholder.com/600x150/F2EDC2/346739?text=Image" : "",
      props: type === "button" ? { url: "#", bgColor: "#346739", color: "#ffffff" } : type === "heading" ? { align: "left", color: "#346739" } : {},
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    setBlocks(newBlocks);
  };

  const generateHTML = () => {
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#f5f5f5;}table{border-collapse:collapse;}.container{max-width:600px;margin:0 auto;background:#ffffff;}</style></head><body><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table class="container" width="600" cellpadding="0" cellspacing="0" style="padding:32px;">`;
    blocks.forEach((b) => {
      switch (b.type) {
        case "heading":
          html += `<tr><td style="padding:16px 0;text-align:${b.props?.align || "left"};"><h1 style="margin:0;color:${b.props?.color || "#346739"};font-size:28px;font-weight:800;">${b.content}</h1></td></tr>`;
          break;
        case "text":
          html += `<tr><td style="padding:8px 0;color:#555;font-size:16px;line-height:1.6;">${b.content}</td></tr>`;
          break;
        case "image":
          html += `<tr><td style="padding:16px 0;"><img src="${b.content}" alt="" style="width:100%;border-radius:12px;display:block;" /></td></tr>`;
          break;
        case "button":
          html += `<tr><td style="padding:16px 0;text-align:center;"><a href="${b.props?.url || "#"}" style="display:inline-block;padding:14px 32px;background:${b.props?.bgColor || "#346739"};color:${b.props?.color || "#fff"};text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;">${b.content}</a></td></tr>`;
          break;
        case "divider":
          html += `<tr><td style="padding:16px 0;"><hr style="border:none;border-top:1px solid #e5e5e5;" /></td></tr>`;
          break;
        case "spacer":
          html += `<tr><td style="padding:24px 0;"></td></tr>`;
          break;
      }
    });
    html += `</table></td></tr></table></body></html>`;
    return html;
  };

  const renderBlockPreview = (block: Block, idx: number) => {
    const isSelected = selectedBlock === block.id;
    return (
      <div
        key={block.id}
        className={`relative group cursor-pointer transition-all duration-200 ${
          isSelected ? "ring-2 ring-brand-base rounded-xl" : "hover:ring-1 hover:ring-gray-200 rounded-xl"
        } ${dragOverIdx === idx ? "border-t-2 border-brand-base" : ""}`}
        onClick={() => setSelectedBlock(block.id)}
        onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
        onDragLeave={() => setDragOverIdx(null)}
        onDrop={() => setDragOverIdx(null)}
      >
        <div className="p-4">
          {block.type === "heading" && (
            <h1
              style={{ color: block.props?.color || "#346739", textAlign: (block.props?.align as any) || "left" }}
              className="text-2xl font-extrabold"
            >
              {block.content}
            </h1>
          )}
          {block.type === "text" && <p className="text-gray-600 leading-relaxed">{block.content}</p>}
          {block.type === "image" && (
            <img src={block.content} alt="" className="w-full rounded-xl" />
          )}
          {block.type === "button" && (
            <div className="text-center">
              <span
                className="inline-block px-8 py-3 rounded-xl font-bold text-sm"
                style={{ background: block.props?.bgColor, color: block.props?.color }}
              >
                {block.content}
              </span>
            </div>
          )}
          {block.type === "divider" && <hr className="border-gray-200" />}
          {block.type === "spacer" && <div className="h-8" />}
        </div>

        {/* Block controls */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, -1); }} className="w-7 h-7 rounded-lg bg-white shadow-md border text-xs hover:bg-gray-50 flex items-center justify-center">↑</button>
          <button onClick={(e) => { e.stopPropagation(); moveBlock(idx, 1); }} className="w-7 h-7 rounded-lg bg-white shadow-md border text-xs hover:bg-gray-50 flex items-center justify-center">↓</button>
          <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="w-7 h-7 rounded-lg bg-white shadow-md border text-xs text-red-500 hover:bg-red-50 flex items-center justify-center">×</button>
        </div>
      </div>
    );
  };

  const selected = blocks.find((b) => b.id === selectedBlock);
  const saveTemplate = async () => {
    if (!token) return;
    try {
      await apiRequest(
        "/api/templates",
        {
          method: "POST",
          body: JSON.stringify({
            name: templateName || "Untitled Template",
            htmlContent: generateHTML(),
          }),
        },
        token
      );
      setSaveMessage("Template saved");
    } catch (error: any) {
      setSaveMessage(error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-2xl font-extrabold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
            />
            <HiOutlinePencilAlt className="text-gray-300" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "edit" ? "bg-white shadow-sm text-brand-dark" : "text-gray-500"
                }`}
              >
                <HiOutlineTemplate className="text-base" /> Edit
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "preview" ? "bg-white shadow-sm text-brand-dark" : "text-gray-500"
                }`}
              >
                <HiOutlineEye className="text-base" /> Preview
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === "code" ? "bg-white shadow-sm text-brand-dark" : "text-gray-500"
                }`}
              >
                <HiOutlineCode className="text-base" /> Code
              </button>
            </div>
            <button onClick={saveTemplate} className="btn-primary flex items-center gap-2 text-sm">
              <HiOutlineSave className="text-lg" /> Save Template
            </button>
          </div>
        </div>
        {saveMessage ? <p className="text-sm text-brand-dark mb-3">{saveMessage}</p> : null}

        {viewMode === "code" ? (
          <div className="card !p-0 overflow-hidden">
            <div className="bg-gray-900 text-green-400 p-6 font-mono text-xs overflow-auto max-h-[70vh]">
              <pre>{generateHTML()}</pre>
            </div>
          </div>
        ) : viewMode === "preview" ? (
          <div className="flex justify-center">
            <div className="w-full max-w-[640px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: generateHTML() }} />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Block Palette */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Add Block</h3>
                <div className="grid grid-cols-2 gap-2">
                  {blockTypes.map((bt) => (
                    <button
                      key={bt.id}
                      onClick={() => addBlock(bt.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-brand-base hover:bg-brand-bg/20 transition-all text-center group"
                    >
                      <span className="text-xl">{bt.icon}</span>
                      <span className="text-xs font-medium text-gray-500 group-hover:text-brand-dark">{bt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-gray-100 rounded-2xl p-6 min-h-[500px]">
                <div className="bg-white rounded-xl shadow-sm max-w-[600px] mx-auto overflow-hidden">
                  {blocks.length === 0 ? (
                    <div className="p-16 text-center">
                      <HiOutlinePhotograph className="text-5xl text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">Start building your email</p>
                      <p className="text-sm text-gray-300 mt-1">Add blocks from the left panel</p>
                    </div>
                  ) : (
                    blocks.map((block, idx) => renderBlockPreview(block, idx))
                  )}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Properties</h3>
                {selected ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
                      <p className="text-sm font-medium text-gray-900 capitalize">{selected.type}</p>
                    </div>
                    {(selected.type === "heading" || selected.type === "text" || selected.type === "button") && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Content</label>
                        <textarea
                          value={selected.content}
                          onChange={(e) => updateBlock(selected.id, e.target.value)}
                          rows={3}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-base/40 resize-none"
                        />
                      </div>
                    )}
                    {selected.type === "image" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URL</label>
                        <input
                          type="text"
                          value={selected.content}
                          onChange={(e) => updateBlock(selected.id, e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-base/40"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => deleteBlock(selected.id)}
                      className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      Delete Block
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Select a block to edit its properties</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
