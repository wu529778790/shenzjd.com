import { ModeToggle } from "@/app/_components/modeToggle";

export function Nav() {
  return (
    <div className="flex justify-between p-4 border-b">
      <div className="text-2xl font-bold">导航</div>
      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </div>
  );
}
