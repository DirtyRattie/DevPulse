import { cn } from "@/lib/utils";
import { SENTIMENT_COLORS } from "@/lib/constants";

interface SentimentDotProps {
  type: "positive" | "negative" | "neutral";
  className?: string;
}

export function SentimentDot({ type, className }: SentimentDotProps) {
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 rounded-full", SENTIMENT_COLORS[type], className)}
      title={type}
    />
  );
}
