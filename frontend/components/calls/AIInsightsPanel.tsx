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

const insightBgColor: Record<InsightType, string> = {
  UPSELL: "bg-blue-50",
  FLAG_MLR: "bg-red-50",
  ENGAGEMENT_SCORE: "bg-green-50",
  SUGGEST_DATA: "bg-purple-50",
  NEXT_BEST_ACTION: "bg-amber-50",
};

const insightTextColor: Record<InsightType, string> = {
  UPSELL: "text-blue-700",
  FLAG_MLR: "text-red-700",
  ENGAGEMENT_SCORE: "text-green-700",
  SUGGEST_DATA: "text-purple-700",
  NEXT_BEST_ACTION: "text-amber-700",
};

function formatTypeLabel(type: InsightType): string {
  return type.replace(/_/g, " ");
}

export function AIInsightsPanel({ insights, className }: AIInsightsPanelProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-gray-900">AI Insights</h3>

      {insights.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            "rounded-lg border border-black/[0.08] border-l-4 bg-white p-3",
            insightBorderColor[insight.insightType]
          )}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                insightBgColor[insight.insightType],
                insightTextColor[insight.insightType]
              )}
            >
              {formatTypeLabel(insight.insightType)}
            </span>
            <span className="text-xs text-gray-400 tabular-nums">
              {Math.round(insight.confidence * 100)}%
            </span>
          </div>

          <p className="text-sm font-medium text-gray-800">{insight.title}</p>
          <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">
            {insight.description}
          </p>
        </div>
      ))}

      {insights.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-400">No insights yet.</p>
        </div>
      )}
    </div>
  );
}
