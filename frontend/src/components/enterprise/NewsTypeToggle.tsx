"use client";

import { Link as LinkIcon, FileText } from "lucide-react";

interface NewsTypeToggleProps {
  type: "link" | "post";
  onChange: (type: "link" | "post") => void;
  linkLabel?: string;
  postLabel?: string;
}

export function NewsTypeToggle({
  type,
  onChange,
  linkLabel = "Link",
  postLabel = "Post",
}: NewsTypeToggleProps) {
  return (
    <div className="flex gap-3" role="radiogroup" aria-label="News type">
      <button
        type="button"
        role="radio"
        aria-checked={type === "link"}
        onClick={() => onChange("link")}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
          type === "link"
            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
            : "bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500"
        }`}
      >
        <LinkIcon className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">{linkLabel}</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={type === "post"}
        onClick={() => onChange("post")}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
          type === "post"
            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
            : "bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500"
        }`}
      >
        <FileText className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">{postLabel}</span>
      </button>
    </div>
  );
}
