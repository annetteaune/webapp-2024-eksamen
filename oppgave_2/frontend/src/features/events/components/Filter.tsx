"use client";
import { useTypes } from "@/features/types/hooks/useTypes";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Filter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { types, isLoading: isLoadingTypes } = useTypes();

  // konverterer typenavn til url-vennlig format, tar høyde for norske bokstaver og mellomrom
  // fått hjelp av claude.ai
  const getTypeSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/\s+/g, "-");
  };

  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || ""
  );
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get("month") || ""
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || ""
  );

  const years = Array.from({ length: 3 }, (_, i) => 2024 + i);

  const months = [
    { value: "1", label: "Januar" },
    { value: "2", label: "Februar" },
    { value: "3", label: "Mars" },
    { value: "4", label: "April" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const resetFilters = () => {
    setSelectedType("");
    setSelectedMonth("");
    setSelectedYear("");
    router.push("/");
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (selectedType) {
      const selectedTypeObj = types.find((t) => t.id === selectedType);
      if (selectedTypeObj) {
        params.set("type", getTypeSlug(selectedTypeObj.name));
      }
    } else {
      params.delete("type");
    }

    if (selectedMonth) {
      params.set("month", selectedMonth);
    } else {
      params.delete("month");
    }

    if (selectedYear) {
      params.set("year", selectedYear);
    } else {
      params.delete("year");
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  }, [selectedType, selectedMonth, selectedYear, router, searchParams, types]);

  return (
    <div className="filter-container">
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="filter-select"
      >
        <option value="">Alle typer</option>
        {!isLoadingTypes &&
          types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
      </select>

      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="filter-select"
      >
        <option value="">Alle måneder</option>
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="filter-select"
      >
        <option value="">Alle år</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <button onClick={resetFilters} className="btn primary-btn">
        Nullstill filtre
      </button>
    </div>
  );
}
