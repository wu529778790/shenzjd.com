import Image from "next/image";

interface SiteCardProps {
  title: string;
  url: string;
  favicon?: string;
}

export function SiteCard({ title, url, favicon }: SiteCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="relative w-12 h-12 mb-2">
        {favicon ? (
          <Image
            src={favicon}
            alt={title}
            fill
            className="object-contain rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg" />
        )}
      </div>
      <span className="text-sm text-center text-gray-700 line-clamp-1">
        {title}
      </span>
    </a>
  );
}
