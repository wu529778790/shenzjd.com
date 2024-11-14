import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchSiteDataApi } from "./api";

function AddNavigationModal() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const fetchSiteData = async () => {
    try {
      const { title, description, image } = await fetchSiteDataApi(url);
      setTitle(title);
      setDescription(description);
      setImage(image);
    } catch (error) {
      console.error("获取网站数据时出错:", error);
    }
  };

  const handleSubmit = () => {
    const newSite = {
      name: title,
      url,
      description,
      image,
    };
    console.log("新网站已添加:", newSite);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">添加导航</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加导航</DialogTitle>
          <DialogDescription>
            在此处添加新导航。完成后点击保存。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              网址
            </Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="输入网址"
              className="w-full"
            />
          </div>
          <Button onClick={fetchSiteData} className="col-span-4">
            获取网站数据
          </Button>
          <div className="site-data col-span-4">
            <div className="subtitle">标题: {title}</div>
            <div className="description">描述: {description}</div>
            {image && <img src={image} alt="网站图标" className="image" />}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} type="submit">
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNavigationModal;
