"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useEscapeKey } from "@/lib/hooks";
import { useCityAutocomplete, type City } from "@/hooks/useCityAutocomplete";

export interface CityAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
  error?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function CityAutocomplete({
  value = "",
  onChange,
  placeholder = "Wybierz miasto...",
  className,
  size = "default",
  error,
  disabled = false,
  id,
  name,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>(
    {},
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const { query, setQuery, filteredCities } = useCityAutocomplete();

  // Sync external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const closeDropdown = React.useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Use shared hook for Escape key
  useEscapeKey(closeDropdown, isOpen);

  const updateDropdownPosition = React.useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 40,
      });
    }
  }, []);

  const openDropdown = React.useCallback(() => {
    updateDropdownPosition();
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, [updateDropdownPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setQuery(newValue);
    openDropdown();
  };

  const handleSelect = (city: City) => {
    setInputValue(city.name);
    setQuery("");
    onChange?.(city.name);
    closeDropdown();
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleSelect(filteredCities[highlightedIndex]);
        }
        break;
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDropdown]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updateDropdownPosition]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const sizeStyles = size === "lg" ? "h-14 text-lg" : "h-12 text-base";

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.length >= 2) {
            setQuery(inputValue);
            openDropdown();
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        role="combobox"
        className={cn(
          "flex w-full items-center justify-between rounded-lg border-2 bg-slate-800/50 text-white placeholder:text-white outline-none transition-all focus-visible:border-orange-500",
          "border-slate-700",
          error && "border-red-500 focus-visible:border-red-500",
          "px-4",
          sizeStyles,
          className,
        )}
      />
      {showDropdown &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            style={{
              ...dropdownStyle,
              overscrollBehavior: "contain",
              scrollbarWidth: "thin",
              scrollbarColor: "#475569 transparent",
            }}
            className={cn(
              "overflow-auto rounded-lg border-2 shadow-lg",
              "bg-slate-900 border-slate-700",
              size === "lg" ? "max-h-64" : "max-h-56",
            )}
          >
            {filteredCities.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-slate-400">
                Nie znaleziono miasta
              </div>
            ) : (
              filteredCities.slice(0, 100).map((city, index) => (
                <button
                  key={city.name}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(city);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex w-full cursor-default items-center gap-2 px-3 py-2.5 text-left text-base outline-hidden select-none transition-colors",
                    "text-slate-100",
                    index === highlightedIndex
                      ? "bg-slate-700 text-white"
                      : "hover:bg-slate-800 hover:text-white",
                  )}
                >
                  {city.name}
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
