"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="输入搜索内容"
        />
      </div>
    </div>
  );
}
