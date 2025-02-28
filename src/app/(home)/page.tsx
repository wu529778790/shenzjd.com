"use client";

import { AddDialog } from "./components/addDialog";
import { ModeToggle } from "./components/modeToggle";
import { SiteCard } from "./components/SiteCard";
import { useState } from "react";

interface Site {
  title: string;
  description: string;
  url: string;
  icon?: string;
}

export default function HomePage() {
  const [sites, setSites] = useState<Site[]>([]);

  const handleAddSuccess = (newSite: Site) => {
    setSites((prevSites) => [...prevSites, newSite]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">我的导航</h1>
        <div className="flex items-center gap-2">
          <AddDialog onAddSuccess={handleAddSuccess} />
          <ModeToggle />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {sites.map((site, index) => (
          <SiteCard
            key={index}
            title={site.title}
            url={site.url}
            icon={site.icon}
          />
        ))}
      </div>
    </div>
  );
}
