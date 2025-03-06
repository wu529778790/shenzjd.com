"use client";

import { Search, X } from "lucide-react";
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
  group: "traditional" | "ai";
}

const searchEngines: SearchEngine[] = [
  // 传统搜索引擎
  {
    id: "baidu",
    name: "百度",
    url: "https://www.baidu.com/s?wd=",
    group: "traditional",
  },
  {
    id: "google",
    name: "谷歌",
    url: "https://www.google.com/search?q=",
    group: "traditional",
  },
  {
    id: "bing",
    name: "必应",
    url: "https://www.bing.com/search?q=",
    group: "traditional",
  },
  {
    id: "sogou",
    name: "搜狗",
    url: "https://www.sogou.com/web?query=",
    group: "traditional",
  },
  {
    id: "360",
    name: "360搜索",
    url: "https://www.so.com/s?q=",
    group: "traditional",
  },

  // AI搜索引擎
  { id: "metaso", name: "秘塔AI", url: "https://metaso.cn/?q=%s", group: "ai" },
  {
    id: "nanoai",
    name: "纳米AI",
    url: "https://www.n.cn/search/?q=",
    group: "ai",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    url: "https://www.perplexity.ai/search?q=",
    group: "ai",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    url: "https://chat.openai.com/search?q=",
    group: "ai",
  },
  {
    id: "kimi",
    name: "Kimi",
    url: "https://kimi.moonshot.cn/search?q=",
    group: "ai",
  },
];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<string>("baidu");
  const inputRef = useRef<HTMLInputElement>(null);

  // 在组件挂载后从localStorage读取缓存的搜索引擎
  useEffect(() => {
    const savedEngine = localStorage.getItem("selectedSearchEngine");
    if (savedEngine) {
      setSelectedEngine(savedEngine);
    }
    inputRef.current?.focus();
  }, []);

  // 当选择的搜索引擎改变时，更新localStorage
  const handleEngineChange = (value: string) => {
    setSelectedEngine(value);
    localStorage.setItem("selectedSearchEngine", value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      performSearch();
    }
  };

  const performSearch = () => {
    if (!query.trim()) return;
    const engine = searchEngines.find((e) => e.id === selectedEngine);
    if (engine) {
      window.open(engine.url + encodeURIComponent(query), "_blank");
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex gap-2">
      <div className="w-32">
        <Select value={selectedEngine} onValueChange={handleEngineChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="选择搜索引擎" />
          </SelectTrigger>
          <SelectContent className="max-h-[800px]">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              传统搜索引擎
            </div>
            {searchEngines
              .filter((engine) => engine.group === "traditional")
              .map((engine) => (
                <SelectItem key={engine.id} value={engine.id}>
                  {engine.name}
                </SelectItem>
              ))}
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
              AI搜索引擎
            </div>
            {searchEngines
              .filter((engine) => engine.group === "ai")
              .map((engine) => (
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
            className="w-full h-10 pl-10 pr-10 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder={`在${
              searchEngines.find((e) => e.id === selectedEngine)?.name
            }中搜索`}
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4 cursor-pointer" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
