"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalTooltipProps {
  content: string;
}

/**
 * Tooltip rendered via React portal into document.body,
 * avoiding overflow / z-index clipping from parent containers.
 */
export function PortalTooltip({ content }: PortalTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLElement | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const btn = (e.currentTarget as HTMLElement)
      .closest(".relative")
      ?.querySelector("button");
    if (btn) {
      btnRef.current = btn;
      const rect = btn.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setVisible(false);
    btnRef.current = null;
  };

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {visible &&
        createPortal(
          <div
            className="fixed z-40 pointer-events-none"
            style={{ top: position.top, left: position.left }}
          >
            <div className="bg-slate-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap -translate-x-1/2 -translate-y-full">
              {content}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
