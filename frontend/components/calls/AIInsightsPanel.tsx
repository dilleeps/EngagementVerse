import { cn } from "@/lib/utils";
import type { AIInsight, InsightType } from "@/types";

interface AIInsightsPanelProps {
  insights: AIInsight[];
  className?: string;
}

const insightBorderColor: Record<InsightType, string> = {
  UPSELL: "border-l-blue-500",
  FLAG_MLR: "border-l-red-500",
  ENGAGEMENT_SCORE: "border-l-green-500",
  SUGGEST_DATA: "border-l-purple-500",
  NEXT_BEST_ACTION: "border-l-amber-500",
};

const insightBadgeBg: Record<InsightType, string> = {
  UPSELL: "bg-blue-100 text-blue-800",
  FLAG_MLR: "bg-red-100 text-red-800",
  ENGAGEMENT_SCORE: "bg-green-100 text-green-800",
  SUGGEST_DATA: "bg-purple-100 text-purple-800",
  NEXT_BEST_ACTION: "bg-amber-100 text-amber-800",
};

function typeLabel(type: InsightType): string {
  const labels: Record<InsightType, string> = {
    UPSELL: "Upsell",
    FLAG_MLR: "MLR Flag",
    ENGAGEMENT_SCORE: "Engagement",
    SUGGEST_DATA: "Data Suggestion",
    NEXT_BEST_ACTION: "Next Best Action",
  };
  return labels[type];
}

export function AIInsightsPanel({
  insights,
  className,
}: AIInsightsPanelProps) {
  return (
    <div
      className={cn(
        "border border-black/[0.08] rounded-lg bg-white p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-4">AI insights</h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              "rounded-md border border-black/[0.06] border-l-4 p-3",
              insightBorderColor[insight.insightType]
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  insightBadgeBg[insight.insightType]
                )}
              >
                {typeLabel(insight.insightType)}
              </span>
              <span className="text-xs text-gray-500 tabular-nums">
                {Math.round(insight.confidence * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
        {insights.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No insights yet
          </p>
        )}
      </div>
    </div>
  );
}
