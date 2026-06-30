import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  prevSemValue?: number;
  prevYearValue?: number;
  valueSuffix?: string;
  formatType?: "percentage" | "currency" | "number";
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  prevSemValue,
  prevYearValue,
  valueSuffix = "",
  formatType = "number"
}: MetricCardProps) {
  const renderTrend = (diff: number, label: string) => {
    if (diff === 0 || isNaN(diff)) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
          <Minus className="w-3.5 h-3.5" />
          {label} 변동 없음
        </span>
      );
    }

    const isPositive = diff > 0;
    const absDiff = Math.abs(diff).toFixed(1);

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
          isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
        }`}
      >
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {absDiff}% {isPositive ? "상승" : "하락"} ({label})
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all duration-150">
      <div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">{title}</span>
          {icon && <div className="p-1 sm:p-1.5 bg-slate-50 rounded-lg text-slate-400 shrink-0">{icon}</div>}
        </div>
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1">
          <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 break-all">
            {value}
            {valueSuffix && <span className="text-[10px] sm:text-xs font-semibold text-slate-400 ml-0.5 sm:ml-1">{valueSuffix}</span>}
          </span>
        </div>
        {subtitle && <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1 sm:mt-2 line-clamp-1 italic">{subtitle}</p>}
      </div>

      {(prevSemValue !== undefined || prevYearValue !== undefined) && (
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-150 flex flex-col gap-1 sm:gap-1.5">
          {prevSemValue !== undefined && renderTrend(prevSemValue, "직전")}
          {prevYearValue !== undefined && renderTrend(prevYearValue, "전년")}
        </div>
      )}
    </div>
  );
}
