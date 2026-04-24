"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface AppTab {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

interface AppProps {
  title: string;
  back?: boolean | string;
  actions?: ReactNode;
  tabs?: AppTab[];
  loading?: boolean;
  children: ReactNode;
  contentClassName?: string;
}

const easeOut = [0.4, 0, 0.2, 1] as const;

export function App({
  title,
  back,
  actions,
  tabs,
  loading = false,
  children,
  contentClassName,
}: AppProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof back === "string") {
      router.push(back);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <motion.div
          className="bg-primary px-4 py-4 mb-4 text-primary-foreground shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {back && <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />}
              <div className="h-7 w-32 bg-white/20 rounded animate-pulse" />
            </div>
            {actions && <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />}
          </div>
        </motion.div>

        <motion.div
          className={cn(
            "flex-1 overflow-y-auto px-4 py-6",
            tabs ? "pb-36" : "",
            contentClassName
          )}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: easeOut }}
        >
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </motion.div>

        {tabs && (
          <motion.div
            className="fixed left-4 right-4 z-50 mx-auto max-w-md"
            style={{ bottom: 96 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: easeOut }}
          >
            <div
              className="border border-border bg-card p-1.5"
              style={{
                borderRadius: "1rem 1rem 0 0",
                borderBottom: "none",
                boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)"
              }}
            >
              <div className="flex gap-1">
                {tabs.map((_, idx) => (
                  <div key={idx} className="flex-1">
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  if (tabs) {
    return (
      <div className="flex h-full flex-col">
        <motion.div
          className="bg-primary px-4 py-4 mb-4 text-primary-foreground shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: easeOut }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {back && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: easeOut }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </motion.div>
              )}
              <motion.h1
                className="text-xl font-semibold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15, ease: easeOut }}
              >
                {title}
              </motion.h1>
            </div>
            {actions && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15, ease: easeOut }}
              >
                {actions}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          className={cn("flex-1 overflow-y-auto px-4 py-6 pb-36", contentClassName)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: easeOut }}
        >
          {children}
        </motion.div>

        <motion.div
          className="fixed left-4 right-4 z-50 mx-auto max-w-md"
          style={{ bottom: 96 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: easeOut }}
        >
          <div
            className="border border-border bg-card p-1.5 transition-all duration-300 ease-in-out"
            style={{
              borderRadius: "1rem 1rem 0 0",
              borderBottom: "none",
              boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 -2px 4px -2px rgb(0 0 0 / 0.1)"
            }}
          >
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1">
                {tabs.map((tab, idx) => (
                  <motion.button
                    key={idx}
                    onClick={tab.disabled ? undefined : tab.onClick}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out",
                      tab.active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                    whileHover={!tab.disabled ? { scale: 1.05 } : undefined}
                    whileTap={!tab.disabled ? { scale: 0.95 } : undefined}
                    animate={{
                      scale: tab.active ? 1.02 : 1
                    }}
                    transition={{ duration: 0.2, ease: easeOut }}
                  >
                    {tab.icon ? (
                      <span className="flex items-center gap-1">
                        {tab.label}
                        {tab.icon}
                      </span>
                    ) : (
                      tab.label
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <motion.div
        className="bg-primary px-4 py-4 mb-4 text-primary-foreground shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: easeOut }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {back && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: easeOut }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
            <motion.h1
              className="text-xl font-semibold"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: easeOut }}
            >
              {title}
            </motion.h1>
          </div>
          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: easeOut }}
            >
              {actions}
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        className={cn("flex-1 overflow-y-auto px-4 py-6", contentClassName)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: easeOut }}
      >
        {children}
      </motion.div>
    </div>
  );
}
