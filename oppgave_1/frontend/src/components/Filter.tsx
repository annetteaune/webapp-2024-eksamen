import type { Category, SelectChangeEvent } from "@/interfaces/types";

interface FilterProps {
  categories: Category[];
  value: string;
  onChange: (event: SelectChangeEvent) => void;
}

export default function Filter({ categories, value, onChange }: FilterProps) {
  return (
    <label className="flex flex-col text-xs font-semibold" htmlFor="filter">
      <span className="sr-only mb-1 block">Velg kategori:</span>
      <select
        id="filter"
        name="filter"
        data-testid="filter"
        value={value}
        onChange={onChange}
        className="min-w-[200px] rounded bg-slate-200"
      >
        <option value="">Alle</option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
