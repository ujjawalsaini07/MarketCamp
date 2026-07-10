"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import {
  Type, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, MousePointerClick,
  Minus, MoveVertical, Columns2, LayoutGrid, Share2, List as ListIcon, Play,
  Code2, PanelBottom, GripVertical, Trash2, Copy, ArrowUp, ArrowDown, Eye,
  LayoutTemplate, Download, Plus, X, Undo2, Redo2, Monitor, Smartphone, ArrowLeft
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

/* ---------------------------------------------------------------- */
/* Block registry                                                    */
/* ---------------------------------------------------------------- */

const BLOCK_DEFS = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'text', label: 'Text Block', icon: AlignLeft },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'button', label: 'Button', icon: MousePointerClick },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'spacer', label: 'Spacer', icon: MoveVertical },
  { type: 'columns2', label: '2 Columns', icon: Columns2 },
  { type: 'columns3', label: '3 Columns', icon: LayoutGrid },
  { type: 'social', label: 'Social Icons', icon: Share2 },
  { type: 'list', label: 'List', icon: ListIcon },
  { type: 'video', label: 'Video', icon: Play },
  { type: 'html', label: 'HTML', icon: Code2 },
  { type: 'footer', label: 'Footer', icon: PanelBottom },
];

const FONT_OPTIONS = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
  { value: "'Courier New', Courier, monospace", label: 'Courier New' },
];

function uid() {
  return 'b' + Math.random().toString(36).slice(2, 9);
}

function createBlock(type: string): any {
  const id = uid();
  switch (type) {
    case 'heading':
      return { id, type, text: 'Welcome to Our Newsletter', level: 'h1', align: 'center', color: '#146c43', fontSize: 28, fontWeight: '700', paddingY: 16 };
    case 'text':
      return { id, type, text: 'Add your message here. Tell subscribers what this email is about.', align: 'left', color: '#374151', fontSize: 15, lineHeight: 1.6, paddingY: 8 };
    case 'image':
      return { id, type, src: 'https://placehold.co/600x300/e5e7eb/94a3b8?text=Image', alt: 'Image', link: '', width: 100, align: 'center', radius: 0, paddingY: 8 };
    case 'button':
      return { id, type, text: 'Shop Now', url: 'https://', bgColor: '#146c43', textColor: '#ffffff', align: 'center', radius: 6, fontSize: 16, paddingX: 28, paddingY: 14, blockPaddingY: 16 };
    case 'divider':
      return { id, type, color: '#e5e7eb', thickness: 1, style: 'solid', paddingY: 16 };
    case 'spacer':
      return { id, type, height: 24 };
    case 'columns2':
      return { id, type, gap: 16, paddingY: 12, columns: [{ content: 'Column one text goes here.' }, { content: 'Column two text goes here.' }] };
    case 'columns3':
      return { id, type, gap: 12, paddingY: 12, columns: [{ content: 'Column one' }, { content: 'Column two' }, { content: 'Column three' }] };
    case 'social':
      return {
        id, type, align: 'center', iconColor: '#146c43', size: 32,
        platforms: [
          { name: 'facebook', url: '', enabled: true },
          { name: 'twitter', url: '', enabled: true },
          { name: 'instagram', url: '', enabled: true },
          { name: 'linkedin', url: '', enabled: false },
          { name: 'youtube', url: '', enabled: false },
        ],
        paddingY: 16,
      };
    case 'list':
      return { id, type, ordered: false, items: ['First point', 'Second point', 'Third point'], color: '#374151', fontSize: 15, paddingY: 8 };
    case 'video':
      return { id, type, thumbnail: 'https://placehold.co/600x338/1f2937/ffffff?text=Video', videoUrl: 'https://', paddingY: 8 };
    case 'html':
      return { id, type, code: '<p style="text-align:center;color:#6b7280;font-size:13px;">Custom HTML block</p>' };
    case 'footer':
      return { id, type, text: '© 2026 Your Company. All rights reserved.', unsubText: 'Unsubscribe', unsubUrl: '#', color: '#9ca3af', bgColor: '#f9fafb', fontSize: 12, align: 'center', paddingY: 24 };
    default:
      return { id, type };
  }
}

function getInitialBlocks() {
  return [
    { ...createBlock('heading') },
    { ...createBlock('text'), text: "Hi there! Thanks for subscribing. We're excited to share the latest updates, tips, and exclusive offers with you." },
    { ...createBlock('text'), text: 'Our team has been working on some amazing things. Stay tuned for exciting announcements coming your way!' },
    { ...createBlock('button') },
    { ...createBlock('divider') },
    { ...createBlock('text'), text: "If you have any questions, reply to this email. We'd love to hear from you!", fontSize: 14 },
    { ...createBlock('footer') },
  ];
}

/* ---------------------------------------------------------------- */
/* HTML generation (single source of truth for canvas + export)      */
/* ---------------------------------------------------------------- */

function escapeHtml(str: any) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nl2br(str: string) {
  return escapeHtml(str).replace(/\n/g, '<br/>');
}

function columnsHtml(b: any, settings: any) {
  const n = b.columns.length;
  const width = (100 / n).toFixed(2);
  const tds = b.columns.map((c: any, i: number) => {
    const padLeft = i > 0 ? b.gap / 2 : 0;
    const padRight = i < n - 1 ? b.gap / 2 : 0;
    return `<td valign="top" style="width:${width}%;padding:0 ${padRight}px 0 ${padLeft}px;font-family:${settings.fontFamily};color:#374151;font-size:14px;line-height:1.5;">${nl2br(c.content)}</td>`;
  }).join('');
  return `<tr><td style="padding:${b.paddingY}px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${tds}</tr></table></td></tr>`;
}

function socialHtml(b: any) {
  const enabled = b.platforms.filter((p: any) => p.enabled);
  const cells = enabled.map((p: any) => {
    const letter = p.name.charAt(0).toUpperCase();
    const fontSize = Math.round(b.size * 0.42);
    return `<td style="padding:0 6px;"><a href="${p.url || '#'}" target="_blank" style="display:inline-block;width:${b.size}px;height:${b.size}px;line-height:${b.size}px;border-radius:50%;background-color:${b.iconColor};color:#ffffff;text-align:center;font-family:Arial,sans-serif;font-size:${fontSize}px;text-decoration:none;">${letter}</a></td>`;
  }).join('');
  const margin = b.align === 'center' ? '0 auto' : b.align === 'right' ? '0 0 0 auto' : '0';
  return `<tr><td style="padding:${b.paddingY}px 24px;text-align:${b.align};"><table role="presentation" cellpadding="0" cellspacing="0" style="margin:${margin};"><tr>${cells}</tr></table></td></tr>`;
}

function listHtml(b: any, settings: any) {
  const Tag = b.ordered ? 'ol' : 'ul';
  const items = b.items.map((i: string) => `<li style="margin-bottom:6px;">${nl2br(i)}</li>`).join('');
  return `<tr><td style="padding:${b.paddingY}px 24px;"><${Tag} style="margin:0;padding-left:20px;color:${b.color};font-size:${b.fontSize}px;font-family:${settings.fontFamily};">${items}</${Tag}></td></tr>`;
}

function blockToHtml(b: any, settings: any) {
  switch (b.type) {
    case 'heading':
      return `<tr><td style="padding:${b.paddingY}px 24px 0 24px;text-align:${b.align};"><${b.level} style="margin:0;color:${b.color};font-size:${b.fontSize}px;font-weight:${b.fontWeight};font-family:${settings.fontFamily};">${escapeHtml(b.text)}</${b.level}></td></tr>`;
    case 'text':
      return `<tr><td style="padding:${b.paddingY}px 24px;text-align:${b.align};"><p style="margin:0;color:${b.color};font-size:${b.fontSize}px;line-height:${b.lineHeight};font-family:${settings.fontFamily};">${nl2br(b.text)}</p></td></tr>`;
    case 'image': {
      const img = `<img src="${b.src}" alt="${escapeHtml(b.alt)}" style="display:block;width:${b.width}%;max-width:100%;border-radius:${b.radius}px;margin:${b.align === 'center' ? '0 auto' : b.align === 'right' ? '0 0 0 auto' : '0'};" />`;
      const wrapped = b.link ? `<a href="${b.link}" target="_blank">${img}</a>` : img;
      return `<tr><td style="padding:${b.paddingY}px 24px;text-align:${b.align};">${wrapped}</td></tr>`;
    }
    case 'button': {
      const margin = b.align === 'center' ? '0 auto' : b.align === 'right' ? '0 0 0 auto' : '0';
      return `<tr><td style="padding:${b.blockPaddingY}px 24px;text-align:${b.align};"><table role="presentation" cellpadding="0" cellspacing="0" style="margin:${margin};"><tr><td style="border-radius:${b.radius}px;background-color:${b.bgColor};"><a href="${b.url}" target="_blank" style="display:inline-block;padding:${b.paddingY}px ${b.paddingX}px;color:${b.textColor};font-size:${b.fontSize}px;font-weight:600;text-decoration:none;border-radius:${b.radius}px;font-family:${settings.fontFamily};">${escapeHtml(b.text)}</a></td></tr></table></td></tr>`;
    }
    case 'divider':
      return `<tr><td style="padding:${b.paddingY}px 24px;"><hr style="border:none;border-top:${b.thickness}px ${b.style} ${b.color};margin:0;" /></td></tr>`;
    case 'spacer':
      return `<tr><td style="height:${b.height}px;line-height:${b.height}px;font-size:1px;">&nbsp;</td></tr>`;
    case 'columns2':
    case 'columns3':
      return columnsHtml(b, settings);
    case 'social':
      return socialHtml(b);
    case 'list':
      return listHtml(b, settings);
    case 'video':
      return `<tr><td style="padding:${b.paddingY}px 24px;text-align:center;"><a href="${b.videoUrl}" target="_blank" style="text-decoration:none;"><img src="${b.thumbnail}" style="display:block;width:100%;max-width:100%;border-radius:8px;" alt="Video thumbnail" /><div style="margin-top:8px;font-family:${settings.fontFamily};font-size:13px;color:#146c43;font-weight:600;">&#9654; Watch Video</div></a></td></tr>`;
    case 'html':
      return `<tr><td style="padding:8px 24px;">${b.code}</td></tr>`;
    case 'footer':
      return `<tr><td style="padding:${b.paddingY}px 24px;text-align:${b.align};background-color:${b.bgColor};"><p style="margin:0 0 8px 0;color:${b.color};font-size:${b.fontSize}px;font-family:${settings.fontFamily};">${escapeHtml(b.text)}</p><a href="${b.unsubUrl}" style="color:${b.color};font-size:${b.fontSize}px;text-decoration:underline;font-family:${settings.fontFamily};">${escapeHtml(b.unsubText)}</a></td></tr>`;
    default:
      return '';
  }
}

function generateHTML(blocks: any[], settings: any) {
  const body = blocks.map((b) => blockToHtml(b, settings)).join('\n');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(settings.templateName)}</title>
</head>
<body style="margin:0;padding:0;background-color:${settings.canvasBg};font-family:${settings.fontFamily};">
${settings.preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">${escapeHtml(settings.preheader)}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${settings.canvasBg};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="${settings.contentWidth}" cellpadding="0" cellspacing="0" style="width:${settings.contentWidth}px;max-width:100%;background-color:${settings.contentBg};">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ---------------------------------------------------------------- */
/* Small UI primitives                                                */
/* ---------------------------------------------------------------- */

function Field({ label, children }: any) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TextInput(props: any) {
  const { className, ...rest } = props;
  return <input {...rest} className={`w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${className || ''}`} />;
}

function TextArea(props: any) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={`w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y ${className || ''}`} />;
}

function SelectInput({ value, onChange, options }: any) {
  return (
    <select value={value} onChange={onChange} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function ColorInput({ value, onChange }: any) {
  return (
    <div className="flex items-center gap-2 border border-slate-300 rounded-md px-2 py-1">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-none p-0 bg-transparent" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 text-sm outline-none font-mono" />
    </div>
  );
}

function AlignButtons({ value, onChange }: any) {
  const opts = [
    { v: 'left', icon: AlignLeft },
    { v: 'center', icon: AlignCenter },
    { v: 'right', icon: AlignRight },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 flex items-center justify-center border rounded-md py-1.5 transition-colors ${active ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function SidebarBlockButton({ def, onAdd }: any) {
  const Icon = def.icon;
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('newBlockType', def.type);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => onAdd(def.type)}
      className="flex flex-col items-center justify-center gap-1.5 border border-slate-200 rounded-lg py-3 hover:border-emerald-600 hover:bg-emerald-50 transition-colors cursor-grab active:cursor-grabbing"
    >
      <Icon size={20} className="text-slate-700" strokeWidth={1.75 as any} />
      <span className="text-xs text-slate-600">{def.label}</span>
    </button>
  );
}

function DropZone({ index, active, onDragOverZone, onDragLeaveZone, onDropZone }: any) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverZone(index);
      }}
      onDragLeave={onDragLeaveZone}
      onDrop={(e) => {
        e.preventDefault();
        onDropZone(e, index);
      }}
      className={`transition-all duration-100 ${active ? 'h-10 mx-2 my-1 bg-emerald-50 border-2 border-dashed border-emerald-500 rounded' : 'h-2'}`}
    />
  );
}

/* ---------------------------------------------------------------- */
/* Block wrapper (canvas)                                             */
/* ---------------------------------------------------------------- */

function BlockWrapper({ block, editing, selected, settings, onSelect, onDelete, onDuplicate, onMoveUp, onMoveDown, onDragStartHandle }: any) {
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody>${blockToHtml(block, settings)}</tbody></table>`;
  return (
    <div
      className={`relative group ${editing ? 'cursor-pointer' : ''} ${editing && selected ? 'ring-2 ring-inset ring-emerald-600' : editing ? 'hover:ring-1 hover:ring-inset hover:ring-emerald-300' : ''}`}
      onClick={editing ? (e) => { e.stopPropagation(); onSelect(); } : undefined}
    >
      {editing && (
        <div className={`absolute top-1 right-1 z-10 ${selected ? 'flex' : 'hidden group-hover:flex'} items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-sm p-0.5`}>
          <span
            draggable
            onDragStart={(e) => { e.stopPropagation(); onDragStartHandle(e); }}
            onClick={(e) => e.stopPropagation()}
            className="p-1 cursor-grab text-slate-400 hover:text-slate-700"
            title="Drag to reorder"
          >
            <GripVertical size={14} />
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 text-slate-400 hover:text-slate-700" title="Move up">
            <ArrowUp size={14} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 text-slate-400 hover:text-slate-700" title="Move down">
            <ArrowDown size={14} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1 text-slate-400 hover:text-slate-700" title="Duplicate">
            <Copy size={14} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-slate-400 hover:text-red-600" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Properties panel                                                   */
/* ---------------------------------------------------------------- */

function renderFields(block: any, update: any) {
  switch (block.type) {
    case 'heading':
      return (
        <>
          <Field label="Heading Text"><TextInput value={block.text} onChange={(e: any) => update({ text: e.target.value })} /></Field>
          <Field label="Heading Level">
            <SelectInput value={block.level} onChange={(e: any) => update({ level: e.target.value })} options={[
              { value: 'h1', label: 'H1 — Large' },
              { value: 'h2', label: 'H2 — Medium' },
              { value: 'h3', label: 'H3 — Small' },
            ]} />
          </Field>
          <Field label="Alignment"><AlignButtons value={block.align} onChange={(v: any) => update({ align: v })} /></Field>
          <Field label="Text Color"><ColorInput value={block.color} onChange={(v: any) => update({ color: v })} /></Field>
          <Field label="Font Size (px)"><TextInput type="number" value={block.fontSize} onChange={(e: any) => update({ fontSize: Number(e.target.value) || 0 })} /></Field>
          <Field label="Font Weight">
            <SelectInput value={block.fontWeight} onChange={(e: any) => update({ fontWeight: e.target.value })} options={[
              { value: '400', label: 'Normal' },
              { value: '600', label: 'Semibold' },
              { value: '700', label: 'Bold' },
              { value: '800', label: 'Extra Bold' },
            ]} />
          </Field>
          <Field label="Top Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'text':
      return (
        <>
          <Field label="Text Content"><TextArea rows={5} value={block.text} onChange={(e: any) => update({ text: e.target.value })} /></Field>
          <Field label="Alignment"><AlignButtons value={block.align} onChange={(v: any) => update({ align: v })} /></Field>
          <Field label="Text Color"><ColorInput value={block.color} onChange={(v: any) => update({ color: v })} /></Field>
          <Field label="Font Size (px)"><TextInput type="number" value={block.fontSize} onChange={(e: any) => update({ fontSize: Number(e.target.value) || 0 })} /></Field>
          <Field label="Line Height"><TextInput type="number" step="0.1" value={block.lineHeight} onChange={(e: any) => update({ lineHeight: Number(e.target.value) || 0 })} /></Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'image':
      return (
        <>
          <Field label="Image URL"><TextInput value={block.src} onChange={(e: any) => update({ src: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Alt Text"><TextInput value={block.alt} onChange={(e: any) => update({ alt: e.target.value })} /></Field>
          <Field label="Link URL (optional)"><TextInput value={block.link} onChange={(e: any) => update({ link: e.target.value })} placeholder="https://..." /></Field>
          <Field label={`Width (${block.width}%)`}>
            <input type="range" min="10" max="100" value={block.width} onChange={(e: any) => update({ width: Number(e.target.value) })} className="w-full accent-emerald-700" />
          </Field>
          <Field label="Alignment"><AlignButtons value={block.align} onChange={(v: any) => update({ align: v })} /></Field>
          <Field label="Corner Radius (px)"><TextInput type="number" value={block.radius} onChange={(e: any) => update({ radius: Number(e.target.value) || 0 })} /></Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'button':
      return (
        <>
          <Field label="Button Text"><TextInput value={block.text} onChange={(e: any) => update({ text: e.target.value })} /></Field>
          <Field label="Link URL"><TextInput value={block.url} onChange={(e: any) => update({ url: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Background Color"><ColorInput value={block.bgColor} onChange={(v: any) => update({ bgColor: v })} /></Field>
          <Field label="Text Color"><ColorInput value={block.textColor} onChange={(v: any) => update({ textColor: v })} /></Field>
          <Field label="Alignment"><AlignButtons value={block.align} onChange={(v: any) => update({ align: v })} /></Field>
          <Field label="Corner Radius (px)"><TextInput type="number" value={block.radius} onChange={(e: any) => update({ radius: Number(e.target.value) || 0 })} /></Field>
          <Field label="Font Size (px)"><TextInput type="number" value={block.fontSize} onChange={(e: any) => update({ fontSize: Number(e.target.value) || 0 })} /></Field>
          <Field label="Horizontal Padding (px)"><TextInput type="number" value={block.paddingX} onChange={(e: any) => update({ paddingX: Number(e.target.value) || 0 })} /></Field>
          <Field label="Vertical Padding (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
          <Field label="Block Spacing (px)"><TextInput type="number" value={block.blockPaddingY} onChange={(e: any) => update({ blockPaddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'divider':
      return (
        <>
          <Field label="Color"><ColorInput value={block.color} onChange={(v: any) => update({ color: v })} /></Field>
          <Field label="Thickness (px)"><TextInput type="number" value={block.thickness} onChange={(e: any) => update({ thickness: Number(e.target.value) || 0 })} /></Field>
          <Field label="Style">
            <SelectInput value={block.style} onChange={(e: any) => update({ style: e.target.value })} options={[
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ]} />
          </Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'spacer':
      return (
        <Field label="Height (px)"><TextInput type="number" value={block.height} onChange={(e: any) => update({ height: Number(e.target.value) || 0 })} /></Field>
      );
    case 'columns2':
    case 'columns3':
      return (
        <>
          <Field label="Column Gap (px)"><TextInput type="number" value={block.gap} onChange={(e: any) => update({ gap: Number(e.target.value) || 0 })} /></Field>
          {block.columns.map((c: any, i: number) => (
            <Field key={i} label={`Column ${i + 1} Content`}>
              <TextArea rows={3} value={c.content} onChange={(e: any) => {
                const cols = [...block.columns];
                cols[i] = { ...cols[i], content: e.target.value };
                update({ columns: cols });
              }} />
            </Field>
          ))}
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'social':
      return (
        <>
          <Field label="Alignment"><AlignButtons value={block.align} onChange={(v: any) => update({ align: v })} /></Field>
          <Field label="Icon Color"><ColorInput value={block.iconColor} onChange={(v: any) => update({ iconColor: v })} /></Field>
          <Field label="Icon Size (px)"><TextInput type="number" value={block.size} onChange={(e: any) => update({ size: Number(e.target.value) || 0 })} /></Field>
          <Field label="Platforms">
            <div className="space-y-2">
              {block.platforms.map((p: any, i: number) => (
                <div key={p.name} className="flex items-center gap-2">
                  <input type="checkbox" checked={p.enabled} onChange={(e: any) => {
                    const arr = [...block.platforms];
                    arr[i] = { ...arr[i], enabled: e.target.checked };
                    update({ platforms: arr });
                  }} className="accent-emerald-700" />
                  <span className="text-xs w-16 capitalize text-slate-600">{p.name}</span>
                  <TextInput placeholder="URL" value={p.url} onChange={(e: any) => {
                    const arr = [...block.platforms];
                    arr[i] = { ...arr[i], url: e.target.value };
                    update({ platforms: arr });
                  }} className="flex-1" />
                </div>
              ))}
            </div>
          </Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'list':
      return (
        <>
          <Field label="List Type">
            <SelectInput value={block.ordered ? 'ordered' : 'unordered'} onChange={(e: any) => update({ ordered: e.target.value === 'ordered' })} options={[
              { value: 'unordered', label: 'Bulleted' },
              { value: 'ordered', label: 'Numbered' },
            ]} />
          </Field>
          <Field label="Items">
            <div className="space-y-2">
              {block.items.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput value={item} onChange={(e: any) => {
                    const arr = [...block.items];
                    arr[i] = e.target.value;
                    update({ items: arr });
                  }} className="flex-1" />
                  <button type="button" onClick={() => update({ items: block.items.filter((_: any, idx: number) => idx !== i) })} className="text-slate-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => update({ items: [...block.items, 'New item'] })} className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                <Plus size={14} /> Add Item
              </button>
            </div>
          </Field>
          <Field label="Text Color"><ColorInput value={block.color} onChange={(v: any) => update({ color: v })} /></Field>
          <Field label="Font Size (px)"><TextInput type="number" value={block.fontSize} onChange={(e: any) => update({ fontSize: Number(e.target.value) || 0 })} /></Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'video':
      return (
        <>
          <Field label="Thumbnail Image URL"><TextInput value={block.thumbnail} onChange={(e: any) => update({ thumbnail: e.target.value })} /></Field>
          <Field label="Video Link URL"><TextInput value={block.videoUrl} onChange={(e: any) => update({ videoUrl: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    case 'html':
      return (
        <>
          <Field label="Custom HTML"><TextArea rows={8} className="font-mono text-xs" value={block.code} onChange={(e: any) => update({ code: e.target.value })} /></Field>
          <p className="text-xs text-slate-400">Advanced: raw HTML is inserted directly into the email.</p>
        </>
      );
    case 'footer':
      return (
        <>
          <Field label="Footer Text"><TextArea rows={2} value={block.text} onChange={(e: any) => update({ text: e.target.value })} /></Field>
          <Field label="Unsubscribe Label"><TextInput value={block.unsubText} onChange={(e: any) => update({ unsubText: e.target.value })} /></Field>
          <Field label="Unsubscribe URL"><TextInput value={block.unsubUrl} onChange={(e: any) => update({ unsubUrl: e.target.value })} /></Field>
          <Field label="Alignment"><AlignButtons value={block.align} onChange={(v: any) => update({ align: v })} /></Field>
          <Field label="Text Color"><ColorInput value={block.color} onChange={(v: any) => update({ color: v })} /></Field>
          <Field label="Background Color"><ColorInput value={block.bgColor} onChange={(v: any) => update({ bgColor: v })} /></Field>
          <Field label="Font Size (px)"><TextInput type="number" value={block.fontSize} onChange={(e: any) => update({ fontSize: Number(e.target.value) || 0 })} /></Field>
          <Field label="Vertical Spacing (px)"><TextInput type="number" value={block.paddingY} onChange={(e: any) => update({ paddingY: Number(e.target.value) || 0 })} /></Field>
        </>
      );
    default:
      return null;
  }
}

function PropertiesPanel({ block, updateBlock, settings, updateSettings, onDuplicate, onDelete }: any) {
  if (!block) {
    return (
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-4">Template Settings</h3>
        <Field label="Preview Text (Preheader)">
          <TextInput value={settings.preheader} onChange={(e: any) => updateSettings({ preheader: e.target.value })} placeholder="Shown next to the subject line in the inbox" />
        </Field>
        <Field label="Content Width (px)"><TextInput type="number" value={settings.contentWidth} onChange={(e: any) => updateSettings({ contentWidth: Number(e.target.value) || 0 })} /></Field>
        <Field label="Canvas Background"><ColorInput value={settings.canvasBg} onChange={(v: any) => updateSettings({ canvasBg: v })} /></Field>
        <Field label="Content Background"><ColorInput value={settings.contentBg} onChange={(v: any) => updateSettings({ contentBg: v })} /></Field>
        <Field label="Base Font Family"><SelectInput value={settings.fontFamily} onChange={(e: any) => updateSettings({ fontFamily: e.target.value })} options={FONT_OPTIONS} /></Field>
        <p className="text-xs text-slate-400 mt-6 leading-relaxed">Select any block on the canvas to edit its content and style, or drag a new block in from the left.</p>
      </div>
    );
  }
  const update = (patch: any) => updateBlock(block.id, patch);
  const label = BLOCK_DEFS.find((d) => d.type === block.type)?.label || block.type;
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</h3>
        <div className="flex gap-1">
          <button type="button" onClick={onDuplicate} className="p-1 text-slate-400 hover:text-slate-700" title="Duplicate"><Copy size={14} /></button>
          <button type="button" onClick={onDelete} className="p-1 text-slate-400 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
      {renderFields(block, update)}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Main component                                                     */
/* ---------------------------------------------------------------- */

function EmailBuilderContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [blocks, setBlocks] = useState<any[]>(getInitialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState('edit'); // edit | preview | code
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [settings, setSettings] = useState({
    templateName: 'Untitled Template',
    preheader: '',
    canvasBg: '#eef0ee',
    contentBg: '#ffffff',
    contentWidth: 600,
    fontFamily: 'Arial, Helvetica, sans-serif',
  });
  
  const [existingId, setExistingId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  useEffect(() => {
    const templateId = searchParams.get("id");
    if (templateId && token) {
      apiRequest<{ templates: any[] }>("/api/templates", {}, token).then((data) => {
        const t = data.templates.find(x => x.id === templateId);
        if (t) {
          updateSettings({ templateName: t.name });
          setExistingId(templateId);
          const match = t.htmlContent.match(/<!--BUILDER_BLOCKS:(.*)-->/);
          if (match && match[1]) {
            try {
              setBlocks(JSON.parse(match[1]));
            } catch(e) {}
          }
        }
      });
    }
  }, [searchParams, token]);

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;
  const generatedHtml = useMemo(() => generateHTML(blocks, settings), [blocks, settings]);

  function commitBlocks(updater: any) {
    setBlocks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next === prev) return prev;
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      return next;
    });
  }
  function undo() {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const previous = u[u.length - 1];
      setRedoStack((r) => [blocks, ...r]);
      setBlocks(previous);
      return u.slice(0, -1);
    });
  }
  function redo() {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[0];
      setUndoStack((u) => [...u, blocks]);
      setBlocks(next);
      return r.slice(1);
    });
  }
  function updateBlock(id: string, patch: any) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function updateSettings(patch: any) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }
  function addBlock(type: string) {
    const nb = createBlock(type);
    commitBlocks((prev: any[]) => {
      if (!selectedId) return [...prev, nb];
      const idx = prev.findIndex((b) => b.id === selectedId);
      if (idx === -1) return [...prev, nb];
      const arr = [...prev];
      arr.splice(idx + 1, 0, nb);
      return arr;
    });
    setSelectedId(nb.id);
  }
  function duplicateBlock(id: string) {
    commitBlocks((prev: any[]) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const copy = JSON.parse(JSON.stringify(prev[idx]));
      copy.id = uid();
      const arr = [...prev];
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
  }
  function deleteBlock(id: string) {
    commitBlocks((prev: any[]) => prev.filter((b) => b.id !== id));
    setSelectedId((sel) => (sel === id ? null : sel));
  }
  function moveBlock(id: string, dir: number) {
    commitBlocks((prev: any[]) => {
      const idx = prev.findIndex((b) => b.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(newIdx, 0, item);
      return arr;
    });
  }
  function handleDropAt(e: any, index: number) {
    const newType = e.dataTransfer.getData('newBlockType');
    const movingId = e.dataTransfer.getData('movingBlockId');
    if (newType) {
      const nb = createBlock(newType);
      commitBlocks((prev: any[]) => {
        const arr = [...prev];
        arr.splice(index, 0, nb);
        return arr;
      });
      setSelectedId(nb.id);
    } else if (movingId) {
      commitBlocks((prev: any[]) => {
        const fromIndex = prev.findIndex((b) => b.id === movingId);
        if (fromIndex === -1) return prev;
        const arr = [...prev];
        const [moved] = arr.splice(fromIndex, 1);
        let insertAt = index;
        if (fromIndex < index) insertAt -= 1;
        arr.splice(insertAt, 0, moved);
        return arr;
      });
    }
    setDragOverIndex(null);
  }
  
  useEffect(() => {
    function handleKeyDown(e: any) {
      const tag = document.activeElement && document.activeElement.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement && (document.activeElement as HTMLElement).isContentEditable);
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (meta && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (meta && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        duplicateBlock(selectedId);
      } else if (!isTyping && (e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteBlock(selectedId);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
  
  async function handleSaveAPI() {
    if (!token) return;
    const finalHtml = `<!--BUILDER_BLOCKS:${JSON.stringify(blocks)}-->\n` + generatedHtml;
    try {
      if (existingId) {
        await apiRequest(`/api/templates/${existingId}`, { method: "PUT", body: JSON.stringify({ name: settings.templateName, htmlContent: finalHtml }) }, token);
      } else {
        await apiRequest("/api/templates", { method: "POST", body: JSON.stringify({ name: settings.templateName, htmlContent: finalHtml }) }, token);
      }
      router.push("/templates");
    } catch (err: any) {
      // Remove console error
      alert("Failed to save template: " + err.message);
    }
  }

  function handleCopy() {
    try {
      navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      /* clipboard unavailable — ignore */
    }
  }

  const editing = mode === 'edit';

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-50 text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }} onClick={() => setSelectedId(null)}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-slate-200 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/templates')}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-100 transition-colors mr-1"
          >
            <ArrowLeft size={20} />
          </button>
          <input
            value={settings.templateName}
            onChange={(e) => updateSettings({ templateName: e.target.value })}
            className="text-lg font-bold border-none outline-none focus:bg-slate-50 rounded px-1.5 -ml-1.5 py-0.5 min-w-[160px]"
          />
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={undo} disabled={undoStack.length === 0} title="Undo (Ctrl+Z)" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent">
            <Undo2 size={16} />
          </button>
          <button type="button" onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Shift+Z)" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent">
            <Redo2 size={16} />
          </button>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
          <TabButton active={mode === 'edit'} onClick={() => setMode('edit')} icon={LayoutTemplate} label="Edit" />
          <TabButton active={mode === 'preview'} onClick={() => setMode('preview')} icon={Eye} label="Preview" />
          <TabButton active={mode === 'code'} onClick={() => setMode('code')} icon={Code2} label="Code" />
        </div>
        {mode === 'preview' && (
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
            <button type="button" onClick={() => setPreviewDevice('desktop')} title="Desktop width" className={`p-1.5 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Monitor size={15} />
            </button>
            <button type="button" onClick={() => setPreviewDevice('mobile')} title="Mobile width" className={`p-1.5 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Smartphone size={15} />
            </button>
          </div>
        )}
        <button type="button" onClick={handleSaveAPI} className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-800 transition-colors shrink-0">
          <Download size={16} /> Save Template
        </button>
      </div>

      {mode === 'code' ? (
        <div className="flex-1 flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shrink-0">
            <span className="text-sm text-slate-500">Generated HTML — paste this into your email service provider</span>
            <div className="flex gap-2">
              <button type="button" onClick={handleCopy} className="text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50">
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button type="button" onClick={handleSaveAPI} className="text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800">
                Save Template
              </button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto p-6 bg-slate-900 text-slate-100 text-xs leading-relaxed font-mono whitespace-pre-wrap">{generatedHtml}</pre>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {editing && (
            <div className="w-64 shrink-0 bg-white border-r border-slate-200 overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Add Block</h3>
              <div className="grid grid-cols-2 gap-2">
                {BLOCK_DEFS.map((def) => (
                  <SidebarBlockButton key={def.type} def={def} onAdd={addBlock} />
                ))}
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto py-10 px-6" style={{ backgroundColor: settings.canvasBg }} onClick={() => setSelectedId(null)}>
            <div
              className="mx-auto shadow-lg transition-all duration-200"
              style={{
                width: mode === 'preview' && previewDevice === 'mobile' ? 375 : settings.contentWidth,
                maxWidth: '100%',
                backgroundColor: settings.contentBg,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {editing && (
                <DropZone
                  index={0}
                  active={dragOverIndex === 0}
                  onDragOverZone={setDragOverIndex}
                  onDragLeaveZone={() => setDragOverIndex(null)}
                  onDropZone={handleDropAt}
                />
              )}
              {blocks.map((block, i) => (
                <React.Fragment key={block.id}>
                  <BlockWrapper
                    block={block}
                    editing={editing}
                    selected={selectedId === block.id}
                    settings={settings}
                    onSelect={() => setSelectedId(block.id)}
                    onDelete={() => deleteBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onMoveUp={() => moveBlock(block.id, -1)}
                    onMoveDown={() => moveBlock(block.id, 1)}
                    onDragStartHandle={(e: any) => {
                      e.dataTransfer.setData('movingBlockId', block.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  />
                  {editing && (
                    <DropZone
                      index={i + 1}
                      active={dragOverIndex === i + 1}
                      onDragOverZone={setDragOverIndex}
                      onDragLeaveZone={() => setDragOverIndex(null)}
                      onDropZone={handleDropAt}
                    />
                  )}
                </React.Fragment>
              ))}
              {blocks.length === 0 && editing && (
                <div className="p-16 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 m-4 rounded-lg">
                  Drag a block from the left, or click one to add it here.
                </div>
              )}
            </div>
          </div>

          {/* Properties */}
          {editing && (
            <div className="w-72 shrink-0 bg-white border-l border-slate-200 overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
              <PropertiesPanel
                block={selectedBlock}
                updateBlock={updateBlock}
                settings={settings}
                updateSettings={updateSettings}
                onDuplicate={() => selectedBlock && duplicateBlock(selectedBlock.id)}
                onDelete={() => selectedBlock && deleteBlock(selectedBlock.id)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmailBuilderPage() {
  return (
    <Suspense fallback={<div>Loading builder...</div>}>
      <EmailBuilderContent />
    </Suspense>
  );
}
