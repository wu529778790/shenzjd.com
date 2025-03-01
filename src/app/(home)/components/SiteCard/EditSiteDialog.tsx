import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  favicon?: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  isLoading: boolean;
}

export function EditSiteDialog({
  open,
  onOpenChange,
  title,
  favicon,
  onTitleChange,
  onSave,
  isLoading,
}: EditSiteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑站点</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            {favicon && (
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={favicon}
                  alt="网站图标"
                  fill
                  sizes="24px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <Input
              placeholder="标题"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <Button onClick={onSave} className="w-full" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
