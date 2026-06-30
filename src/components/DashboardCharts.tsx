import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";

interface TimeSeriesItem {
  label: string;
  year: number;
  semester: string;
  participationRate: number;
  warningEscapeRate: number;
  participantsCount: number;
  averageSatisfaction: number;
  totalBudget: number;
}

interface DashboardChartsProps {
  timeSeriesData: TimeSeriesItem[];
}

export default function DashboardCharts({ timeSeriesData }: DashboardChartsProps) {
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
        차트를 표시할 수 있는 시계열 데이터가 존재하지 않습니다.
      </div>
    );
  }

  // Formatting utility for currency
  const formatKRW = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}백만원`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    }
    return `${value.toLocaleString()}원`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6">
      
      {/* 1. KPI A & B 추이 (참여인원 & 탈출률) */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] col-span-1">
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-tight">핵심 성과 지표(KPI) 추이</h4>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5">학기별 학습지원 프로그램 참여인원 및 학업저성취자 탈출률</p>
        </div>
        <div className="h-44 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={9} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px", padding: "6px" }}
                formatter={(value: any, name: any) => {
                  if (name === "KPI A: 참여인원") return [`${value}%`, name];
                  if (name === "KPI B: 탈출률") return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend verticalAlign="top" height={28} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 9 }} />
              <Line
                name="KPI A: 참여인원"
                type="monotone"
                dataKey="participationRate"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="KPI B: 탈출률"
                type="monotone"
                dataKey="warningEscapeRate"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. KPI A: 참여인원 규모 추이 */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] col-span-1">
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-tight">KPI A: 학습지원 프로그램 참여 학생 수</h4>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5">학기별 학습지원 프로그램 수혜 실인원</p>
        </div>
        <div className="h-44 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={9} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px", padding: "6px" }}
                formatter={(value: any) => [`${value}명`, "KPI A: 참여인원"]}
              />
              <Bar dataKey="participantsCount" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. 소요 예산 시각화 */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] col-span-1">
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-tight">학기별 소요 예산 추이</h4>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5">프로그램 통합 소요 예산 총액</p>
        </div>
        <div className="h-44 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={9} tickLine={false} />
              <YAxis stroke="#4f46e5" fontSize={9} tickLine={false} tickFormatter={formatKRW} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px", padding: "6px" }}
                formatter={(value: any) => [formatKRW(value), "소요 예산"]}
              />
              <Bar dataKey="totalBudget" fill="#c7d2fe" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. 평균 만족도 시각화 */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] col-span-1">
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 leading-tight">학기별 만족도 추이</h4>
          <p className="text-[9px] sm:text-xs text-gray-400 mt-0.5">프로그램 참여자 설문 기반 질적 만족도 평점</p>
        </div>
        <div className="h-44 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={9} tickLine={false} />
              <YAxis domain={[0, 5]} stroke="#f59e0b" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "11px", padding: "6px" }}
                formatter={(value: any) => [`${value}점`, "평균 만족도"]}
              />
              <Line type="monotone" dataKey="averageSatisfaction" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
