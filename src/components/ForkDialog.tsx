import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ForkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ForkDialog({ open, onOpenChange, onConfirm }: ForkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>需要 Fork 仓库</DialogTitle>
          <DialogDescription>
            为了保存您的自定义设置，我们需要将仓库 Fork
            到您的账号下。这只需要执行一次。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onConfirm}>确认 Fork</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
