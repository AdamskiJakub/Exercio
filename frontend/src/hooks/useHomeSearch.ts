"use client";

import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { useRouter } from "@/i18n/routing";

export function useHomeSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");

  const handleSearch = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();

      const query: Record<string, string> = {};

      if (city.trim()) {
        query.city = city.trim();
      }

      if (specialization) {
        query.specialization = specialization;
      }

      if (search.trim()) {
        query.search = search.trim();
      }

      if (type !== "all") {
        query.type = type;
      }

      router.push({ pathname: "/instructors", query });
    },
    [city, specialization, search, type, router],
  );

  return {
    city,
    setCity,
    search,
    setSearch,
    specialization,
    setSpecialization,
    type,
    setType,
    handleSearch,
  };
}
