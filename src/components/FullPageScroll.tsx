"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FullPageScrollProps {
  children: React.ReactNode[];
  className?: string;
  onPageChange?: (pageIndex: number) => void;
  initialPage?: number;
}

export function FullPageScroll({
  children,
  className,
  onPageChange,
  initialPage = 0,
}: FullPageScrollProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const totalPages = React.Children.count(children);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling.current) return;

      isScrolling.current = true;

      if (e.deltaY > 0 && currentPage < totalPages - 1) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        onPageChange?.(nextPage);
      } else if (e.deltaY < 0 && currentPage > 0) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        onPageChange?.(prevPage);
      }

      setTimeout(() => {
        isScrolling.current = false;
      }, 500); // 减少防抖时间到 500ms
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [currentPage, totalPages, onPageChange]);

  // 当外部传入的 initialPage 改变时，更新当前页面
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return (
    <div
      ref={containerRef}
      className={cn("h-screen overflow-hidden", className)}>
      <div
        className="transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateY(-${currentPage * 100}%)` }}>
        {React.Children.map(children, (child, index) => (
          <div key={index} className="h-screen">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
