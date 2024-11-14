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
    <Card className="block p-4 bg-white border border-gray-200 rounded-lg text-center transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-gray-300 hover:text-blue-600">
      <a href={site.url} target="_blank" className="text-decoration-none">
        <div className="flex justify-center items-center h-16 w-16 bg-gray-100 rounded-full overflow-hidden">
          <img
            src={site.image}
            alt={site.name}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
        <CardContent className="p-2">
          <CardHeader className="flex flex-col space-y-1.5 p-6">
            <CardTitle className="text-xl font-bold mb-1">
              {site.name}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              {site.description}
            </CardDescription>
          </CardHeader>
        </CardContent>
      </a>
    </Card>
  );
}

export default SiteLink;
