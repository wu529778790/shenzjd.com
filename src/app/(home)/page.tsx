import { AddDialog } from "./addDialog";

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-end">
        <AddDialog />
      </div>
    </div>
  );
}
