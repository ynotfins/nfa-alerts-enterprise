"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  actions?: ReactNode;
  back?: boolean | string;
  children?: ReactNode;
}

export function Header({ title, actions, back, children }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === "string") {
      router.push(back);
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-primary px-4 py-4 mb-4 text-primary-foreground shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {back && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold animate-in fade-in slide-in-from-left-2 duration-300">{title}</h1>
        </div>
        {actions && <div className="animate-in fade-in slide-in-from-right-2 duration-300">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

interface HeaderSkeletonProps {
  back?: boolean;
  hasActions?: boolean;
  children?: ReactNode;
}

export function HeaderSkeleton({ back, hasActions, children }: HeaderSkeletonProps) {
  return (
    <div className="bg-primary px-4 py-4 mb-4 text-primary-foreground shrink-0 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {back && <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />}
          <div className="h-7 w-32 bg-white/20 rounded animate-pulse" />
        </div>
        {hasActions && <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />}
      </div>
      {children}
    </div>
  );
}
