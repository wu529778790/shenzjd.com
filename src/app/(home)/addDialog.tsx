"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";

export function AddDialog() {
  const [link, setLink] = useState("");
  const handleAdd = () => {
    console.log(link);
    setLink("");
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4" />
          添加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加</DialogTitle>
          <DialogDescription>添加一个新链接</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="请输入链接"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <Button onClick={handleAdd}>添加</Button>
      </DialogContent>
    </Dialog>
  );
}
