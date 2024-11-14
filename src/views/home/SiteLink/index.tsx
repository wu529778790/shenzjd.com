import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Site } from "../types";

function SiteLink({ site }: { site: Site }) {
  return (
    <Card className="flex p-2 bg-white border border-gray-200 rounded-lg transition-all duration-300 ease-in-out hover:transform hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300 hover:text-blue-600">
      <a
        href={site.url}
        target="_blank"
        className="flex items-center text-decoration-none">
        <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full overflow-hidden">
          <img
            src={site.image}
            alt={site.name}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
        <CardContent className="flex flex-col justify-center ml-2">
          <CardHeader className="flex flex-col space-y-0.75">
            <CardTitle className="text-lg font-bold mb-0.5">
              {site.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 truncate">
              {site.description}
            </CardDescription>
          </CardHeader>
        </CardContent>
      </a>
    </Card>
  );
}

export default SiteLink;
