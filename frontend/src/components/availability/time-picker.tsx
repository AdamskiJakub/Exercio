"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Generate hours 00-23
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

// Generate minutes in 15-minute intervals
const MINUTES = ["00", "15", "30", "45"];

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when value prop changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditValue(val);
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Validate and format the time
    const trimmed = editValue.trim();
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (timeRegex.test(trimmed)) {
      onChange(trimmed);
      setEditValue(trimmed);
    } else {
      // Revert to last valid value
      setEditValue(value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const selectTime = (hour: string, minute: string) => {
    const newValue = `${hour}:${minute}`;
    onChange(newValue);
    setEditValue(newValue);
    setIsOpen(false);
  };

  const [currentHour, currentMinute] = value.split(":");

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div
        className="flex items-center gap-1.5 bg-slate-800 border border-slate-600 rounded-lg px-2 py-2.5 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => {
          if (!isEditing) {
            setIsOpen(!isOpen);
          }
        }}
      >
        <Clock className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onFocus={() => setIsEditing(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder="HH:MM"
          className="bg-transparent border-none text-white text-sm focus:outline-none w-full cursor-pointer"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-xl overflow-hidden w-48">
          <div className="flex">
            {/* Hours Column */}
            <div className="flex-1 max-h-48 overflow-y-auto border-r border-slate-700">
              <div className="sticky top-0 bg-slate-800 px-2 py-1 text-xs text-slate-400 font-medium text-center border-b border-slate-700">
                HH
              </div>
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className={`w-full px-2 py-1.5 text-sm text-center transition-colors hover:bg-slate-700 ${
                    hour === currentHour
                      ? "bg-orange-600/20 text-orange-400 font-medium"
                      : "text-slate-200"
                  }`}
                  onClick={() => selectTime(hour, currentMinute || "00")}
                >
                  {hour}
                </button>
              ))}
            </div>

            {/* Minutes Column */}
            <div className="flex-1 max-h-48 overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 px-2 py-1 text-xs text-slate-400 font-medium text-center border-b border-slate-700">
                MM
              </div>
              {MINUTES.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  className={`w-full px-2 py-1.5 text-sm text-center transition-colors hover:bg-slate-700 ${
                    minute === currentMinute
                      ? "bg-orange-600/20 text-orange-400 font-medium"
                      : "text-slate-200"
                  }`}
                  onClick={() => selectTime(currentHour || "09", minute)}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
