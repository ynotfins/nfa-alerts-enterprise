"use client";

export function TypingIndicator() {
  return (
    <div className="flex gap-1.5 px-4 py-3 rounded-[20px] bg-gray-200 dark:bg-muted w-fit">
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
    </div>
  );
}
