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
import { Plus } from "lucide-react";
import { fetchSiteDataApi } from "./api";

function AddNavigationModal() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchSiteData = async () => {
    if (!isValidUrl(url)) {
      console.error("无效的URL");
      return;
    }
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
        <Button className="ml-auto flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          添加导航
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加导航</DialogTitle>
          <DialogDescription>
            在此处添加新导航。完成后点击保存。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-4 col-span-4">
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
          <div className="col-span-4">
            {title && <div className="font-bold">标题: {title}</div>}
            {description && (
              <div className="text-gray-600">描述: {description}</div>
            )}
            {image && <img src={image} alt="网站图标" className="mt-2" />}
          </div>
        </div>
        {(title || description || image) && (
          <DialogFooter>
            <Button onClick={handleSubmit} type="submit">
              保存
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddNavigationModal;
