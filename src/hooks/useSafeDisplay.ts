import { usePrivateMode } from "@/hooks/usePrivateMode";

/**
 * Hook to safely display sensitive trading data based on private/public mode
 */
export function useSafeDisplay() {
  const isPrivate = usePrivateMode();

  const safeStrategyName = (strategy: string | undefined): string => {
    if (isPrivate) return strategy || "Custom";
    // Public mode: anonymize with generic labels
    return "Strategy";
  };

  const safeDollarAmount = (amount: number): string => {
    if (isPrivate) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(amount);
    }
    // Public mode: bucket amounts
    const abs = Math.abs(amount);
    if (abs === 0) return "$0";
    if (abs < 100) return abs < 0 ? "-Small" : "+Small";
    if (abs < 500) return abs < 0 ? "-Medium" : "+Medium";
    return abs < 0 ? "-Large" : "+Large";
  };

  const safePercentage = (value: number): string => {
    // Percentages are generally safe to show
    return `${value.toFixed(2)}%`;
  };

  return {
    isPrivate,
    safeStrategyName,
    safeDollarAmount,
    safePercentage,
  };
}
