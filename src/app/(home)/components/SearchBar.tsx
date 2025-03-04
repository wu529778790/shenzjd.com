"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const searchEngines: SearchEngine[] = [
  { id: "local", name: "站内搜索", url: "" },
  { id: "baidu", name: "百度", url: "https://www.baidu.com/s?wd=" },
  { id: "google", name: "谷歌", url: "https://www.google.com/search?q=" },
  { id: "bing", name: "必应", url: "https://www.bing.com/search?q=" },
  { id: "github", name: "GitHub", url: "https://github.com/search?q=" },
  { id: "zhihu", name: "知乎", url: "https://www.zhihu.com/search?q=" },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    url: "https://search.bilibili.com/all?keyword=",
  },
  { id: "npm", name: "NPM", url: "https://www.npmjs.com/search?q=" },
];

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<string>("local");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (selectedEngine === "local") {
      onSearch?.(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      performSearch();
    }
  };

  const performSearch = () => {
    if (!query.trim()) return;

    if (selectedEngine === "local") {
      onSearch?.(query);
    } else {
      const engine = searchEngines.find((e) => e.id === selectedEngine);
      if (engine) {
        window.open(engine.url + encodeURIComponent(query), "_blank");
      }
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex gap-2">
      <div className="w-32">
        <Select value={selectedEngine} onValueChange={setSelectedEngine}>
          <SelectTrigger>
            <SelectValue placeholder="选择搜索引擎" />
          </SelectTrigger>
          <SelectContent>
            {searchEngines.map((engine) => (
              <SelectItem key={engine.id} value={engine.id}>
                {engine.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder={
              selectedEngine === "local"
                ? "输入搜索内容"
                : `在${
                    searchEngines.find((e) => e.id === selectedEngine)?.name
                  }中搜索`
            }
          />
        </div>
        <button
          onClick={performSearch}
          className="px-4 h-10 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
          搜索
        </button>
      </div>
    </div>
  );
}
