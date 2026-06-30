import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Users,
  Award,
  CircleDollarSign,
  Star,
  RefreshCw,
  HelpCircle,
  FileDown,
  ChevronDown,
  Lock,
  Compass,
  ArrowUpRight
} from "lucide-react";
import MetricCard from "./components/MetricCard";
import ExcelUploader from "./components/ExcelUploader";
import ProgramModal from "./components/ProgramModal";
import ProgramList from "./components/ProgramList";
import DashboardCharts from "./components/DashboardCharts";
import { Program, DashboardMetrics } from "./types";

export default function App() {
  // Filters State
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSemester, setSelectedSemester] = useState<string>("1학기");

  // Data State
  const [metrics, setMetrics] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Guide Toggle State
  const [showGuide, setShowGuide] = useState(false);

  // Active Tab State for Sidebar Layout
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Fetch all dashboard data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch main metrics (calculates participation, escape rate, comparisons)
      const metricsRes = await fetch(`/api/metrics?year=${selectedYear}&semester=${selectedSemester}`);
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // 2. Fetch programs list with analysis
      const programsRes = await fetch(`/api/program-analysis?year=${selectedYear}&semester=${selectedSemester}`);
      const programsData = await programsRes.json();
      setPrograms(programsData);

      // 3. Fetch chronological time-series chart data
      const tsRes = await fetch("/api/time-series");
      const tsData = await tsRes.json();
      setTimeSeries(tsData);
    } catch (err) {
      console.error("데이터를 가져오는 도중 오류 발생:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedSemester]);

  // Handle program additions or updates
  const handleSaveProgram = async (programData: any) => {
    const isEdit = !!programData.id;
    const url = isEdit ? `/api/programs/${programData.id}` : "/api/programs";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(programData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "프로그램 저장에 실패했습니다.");
    }

    // Refresh dashboard
    fetchAllData();
  };

  // Handle program deletions
  const handleDeleteProgram = async (id: string) => {
    const response = await fetch(`/api/programs/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "삭제 중 에러가 발생했습니다.");
    }

    // Refresh dashboard
    fetchAllData();
  };

  const handleEditClick = (program: Program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingProgram(null);
    setIsModalOpen(true);
  };

  // Function to download a mock template for CSV uploads
  const downloadTemplate = (type: "master" | "participants") => {
    let headers = "";
    let filename = "";
    if (type === "master") {
      headers = "학번,성명,직전학기 학사경고 여부,당해학기 GPA,재학 상태\n20231001,강민우,Y,2.15,재학\n20231002,김지아,Y,1.82,재학\n20231004,이지수,Y,1.45,재학\n20241005,정하늘,N,3.85,재학\n20241006,서민우,N,3.40,휴학\n";
      filename = "종합정보시스템_재학생대장_양식.csv";
    } else {
      headers = "학번,성명,학과,이수 여부\n20231001,강민우,컴퓨터공학과,이수\n20231002,김지아,경영학과,이수\n20231004,이지수,전자공학과,이수\n";
      filename = "학습지원프로그램_참여자대장_양식.csv";
    }

    const blob = new Blob(["\ufeff" + headers], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate comparison values safely (difference in percentage points)
  const getComparisonDiff = (currentVal: number, targetVal: number) => {
    if (targetVal === 0 || isNaN(targetVal)) return 0;
    return currentVal - targetVal;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        
        {/* Sidebar Logo Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-1">
            <img
              src="/src/assets/images/ctl_tiger_logo_1782715836735.jpg"
              className="w-9 h-9 rounded-lg object-cover shadow-xs border border-slate-150 shrink-0"
              referrerPolicy="no-referrer"
              alt="CTL Tiger Mascot Logo"
            />
            <h1 className="text-xs font-bold tracking-tight text-slate-800 leading-snug">
              CTL 학습지원 프로그램 성과관리 시스템
            </h1>
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pl-11">
            Center for Teaching & Learning
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex-1 space-y-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
              activeTab === "overview"
                ? "bg-blue-50 text-blue-600 font-bold shadow-xs"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            성과 개요
          </button>

          <button
            onClick={() => setActiveTab("programs")}
            className={`w-full sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
              activeTab === "programs"
                ? "bg-blue-50 text-blue-600 font-bold shadow-xs"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            프로그램 관리
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`w-full sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
              activeTab === "upload"
                ? "bg-blue-50 text-blue-600 font-bold shadow-xs"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            데이터 업로드
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`w-full sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition ${
              activeTab === "guide"
                ? "bg-blue-50 text-blue-600 font-bold shadow-xs"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Compass className="w-4 h-4" />
            양식 및 가이드
          </button>
        </nav>

        {/* User profile footer inside sidebar */}
        <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-xs">
              김
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">김선임 차장</p>
              <p className="text-[10px] text-slate-400 font-medium">Senior Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#F1F5F9]">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-1.5 sm:gap-4">
            <img
              src="/src/assets/images/ctl_tiger_logo_1782715836735.jpg"
              className="md:hidden w-7 h-7 rounded-lg object-cover border border-slate-150 shrink-0"
              referrerPolicy="no-referrer"
              alt="CTL Tiger Mascot Logo"
            />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">대시보드</h2>
            <span className="text-slate-300 text-xs sm:text-sm">|</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:text-blue-600 transition"
              >
                <option value={2026}>2026년 2학기 (현재)</option>
                <option value={2025}>2025년도</option>
                <option value={2024}>2024년도</option>
              </select>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-600 focus:outline-hidden cursor-pointer hover:text-blue-600 transition"
              >
                <option value="1학기">1학기</option>
                <option value="2학기">2학기</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-1 sm:p-1.5 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition"
              title="대시보드 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleAddClick}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] sm:text-xs font-bold shadow-sm transition whitespace-nowrap"
            >
              보고서 내보내기
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Grid Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 space-y-6 pb-24 sm:pb-8">
          
          {/* Active Views rendering */}

          {/* 1. OVERVIEW VIEW */}
          {activeTab === "overview" && (
            <>
              {/* Scorecard Grid */}
              {metrics ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {/* 4.1. KPI A: 학습지원 프로그램 참여인원 */}
                  <MetricCard
                    title="KPI A: 학습지원 프로그램 참여인원"
                    value={metrics.current.participationRate.toFixed(1)}
                    valueSuffix="%"
                    subtitle={`재학생 ${metrics.current.totalEnrolledCount.toLocaleString("ko-KR")}명 대비 실인원 ${metrics.current.uniqueParticipantsCount.toLocaleString("ko-KR")}명`}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    prevSemValue={getComparisonDiff(
                      metrics.current.participationRate,
                      metrics.previousSemester.metrics.participationRate
                    )}
                    prevYearValue={getComparisonDiff(
                      metrics.current.participationRate,
                      metrics.previousYearSameSem.metrics.participationRate
                    )}
                  />

                  {/* 4.2. KPI B: 학업저성취자 탈출률 */}
                  <MetricCard
                    title="KPI B: 학업저성취자 탈출률"
                    value={metrics.current.warningEscapeRate.toFixed(1)}
                    valueSuffix="%"
                    subtitle={`GPA 1.75 이상 달성 (수혜자 ${metrics.current.warningStudentsCount}명 중 ${metrics.current.warningEscapedCount}명)`}
                    icon={<Award className="w-5 h-5 text-emerald-600" />}
                    prevSemValue={getComparisonDiff(
                      metrics.current.warningEscapeRate,
                      metrics.previousSemester.metrics.warningEscapeRate
                    )}
                    prevYearValue={getComparisonDiff(
                      metrics.current.warningEscapeRate,
                      metrics.previousYearSameSem.metrics.warningEscapeRate
                    )}
                  />

                  {/* 4.3. 평균 만족도 점수 */}
                  <MetricCard
                    title="평균 만족도 점수"
                    value={metrics.current.averageSatisfaction.toFixed(2)}
                    valueSuffix=" / 5.0"
                    subtitle={`참여자 설문 기반 (N=${metrics.current.totalParticipantsCount.toLocaleString()})`}
                    icon={<Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                    prevSemValue={getComparisonDiff(
                      metrics.current.averageSatisfaction,
                      metrics.previousSemester.metrics.averageSatisfaction
                    )}
                    prevYearValue={getComparisonDiff(
                      metrics.current.averageSatisfaction,
                      metrics.previousYearSameSem.metrics.averageSatisfaction
                    )}
                  />

                  {/* 4.4. 총 집행 예산 */}
                  <MetricCard
                    title="총 집행 예산"
                    value={`₩${(metrics.current.totalBudget / 1000000).toFixed(1)}M`}
                    valueSuffix=""
                    subtitle={`집행률 84% (프로그램 ${programs.length}종 통합 소요)`}
                    icon={<CircleDollarSign className="w-5 h-5 text-blue-600" />}
                    prevSemValue={getComparisonDiff(
                      metrics.current.totalBudget > 0 ? (metrics.current.totalBudget / (metrics.previousSemester.metrics.totalBudget || 1) - 1) * 100 : 0,
                      0
                    )}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-400">
                  성과지표 데이터를 불러오는 중입니다...
                </div>
              )}

              {/* Charts Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">참여 인원 추이 및 프로그램 분석</h3>
                  <p className="text-xs text-slate-400 mt-0.5">최근 학기별 시계열 데이터와 질적 만족도를 시각화합니다.</p>
                </div>
                <DashboardCharts timeSeriesData={timeSeries} />
              </div>
            </>
          )}

          {/* 2. PROGRAMS VIEW */}
          {activeTab === "programs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">개설 프로그램 성과 분석</h3>
                  <p className="text-xs text-slate-400 mt-0.5">각 교육 프로그램별 학사경고 극복 성과 및 학생 명단을 직접 관리하세요.</p>
                </div>
                <button
                  onClick={handleAddClick}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  프로그램 추가
                </button>
              </div>

              <ProgramList
                programs={programs}
                onEdit={handleEditClick}
                onDelete={handleDeleteProgram}
                onRefresh={fetchAllData}
                year={selectedYear}
                semester={selectedSemester}
              />
            </div>
          )}

          {/* 3. UPLOAD VIEW */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800">대학 종합정보시스템 원천 데이터 등록</h3>
                <p className="text-xs text-slate-400 mt-0.5">교수학습센터의 성과 산출을 위해 학기별 종합 학적 데이터를 등록 및 매칭해 주세요.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Year/Sem Selection Card */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">대상 연도 및 학기 설정</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">데이터를 대장으로 업로드할 학기를 선택하세요.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">분석 연도</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium"
                      >
                        <option value={2024}>2024년도</option>
                        <option value={2025}>2025년도</option>
                        <option value={2026}>2026년도</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">분석 학기</label>
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium"
                      >
                        <option value="1학기">1학기</option>
                        <option value="2학기">2학기</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 text-[11px] leading-relaxed text-slate-500">
                    <span className="font-bold text-blue-600 block mb-0.5">ℹ️ 원천 데이터 무결성 검증</span>
                    업로드하는 대장의 성명, 학번이 유니크하게 인식되며, 미이수자 및 이수자의 학점 분포와 매칭되어 실시간 탈출 수치를 연산합니다.
                  </div>
                </div>

                {/* Uploader Dropzone */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between h-full min-h-[220px]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4.5 h-4.5 text-blue-600" />
                        재학생 및 성적경고 종합대장 업로드
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                        <Lock className="w-3 h-3" /> 대학 본부 인증 채널
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 font-medium">
                      선택된 <span className="font-bold text-blue-600">{selectedYear}년 {selectedSemester}</span>의 총 재학생 정보(분모)와 직전학기 학사경고 대상자의 현재 학기 평점평균(GPA) 데이터를 Excel/CSV로 업로드하세요.
                    </p>
                  </div>

                  <ExcelUploader
                    id="uploader-master"
                    uploadUrl="/api/upload-master"
                    payloadExtra={{ year: selectedYear, semester: selectedSemester }}
                    title=""
                    description="재학생 수, 직전학기 학사경고 여부, 당해학기 평점평균(GPA)이 포함된 엑셀/CSV 데이터를 이곳에 놓아주세요."
                    onSuccess={fetchAllData}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. GUIDE VIEW */}
          {activeTab === "guide" && (
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-5 h-5 text-blue-600" />
                  종합정보시스템 데이터 매칭 및 엑셀 업로드 가이드
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  대학교 종합정보시스템에서 원천 엑셀 파일들을 내려받은 다음, 성과를 산출할 수 있도록 아래 기준에 맞게 시스템에 등록해 주세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Master Guide */}
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-150 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      종합정보시스템 재학생 대장 (마스터 데이터)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      전체 재학생 분모 및 성적경고 여부 판정을 위해 사용하는 학기별 학적 데이터 양식입니다. 
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1.5 mt-3 pl-4 list-disc font-medium">
                      <li>필수 컬럼: <span className="font-semibold text-slate-800">학번, 성명, 직전학기 학사경고 여부, 당해학기 GPA, 재학 상태</span></li>
                      <li>직전학기 학사경고 여부는 <span className="text-rose-600 font-semibold">Y / N</span> 형식으로 인식합니다.</li>
                      <li>당해학기 GPA는 평점평균 수치(0.0 ~ 4.5)를 소수점으로 기록합니다.</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => downloadTemplate("master")}
                    className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-800 mt-5 bg-blue-50 px-3 py-1.5 rounded-lg w-fit transition"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    마스터 CSV 템플릿 다운로드
                  </button>
                </div>

                {/* Roster Guide */}
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-150 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      프로그램별 학생 참여대장 명단
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      각 개별 프로그램에 실제 참여하여 이수한 학부생들의 학번 리스트 양식입니다.
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1.5 mt-3 pl-4 list-disc font-medium">
                      <li>필수 컬럼: <span className="font-semibold text-slate-800">학번, 성명, 학과, 이수 여부</span></li>
                      <li>이수 여부는 <span className="text-blue-600 font-semibold">이수 / 미이수</span> 혹은 Y / N 형식으로 기록합니다.</li>
                      <li>각 개별 프로그램 카드의 <b>[명단 관리]</b>를 확장해 파일을 업로드할 수 있습니다.</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => downloadTemplate("participants")}
                    className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-800 mt-5 bg-blue-50 px-3 py-1.5 rounded-lg w-fit transition"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    참여자 CSV 템플릿 다운로드
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-1 z-50 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "overview" ? "text-blue-600 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] tracking-tight">성과 개요</span>
        </button>

        <button
          onClick={() => setActiveTab("programs")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "programs" ? "text-blue-600 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] tracking-tight">프로그램</span>
        </button>

        <button
          onClick={() => setActiveTab("upload")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "upload" ? "text-blue-600 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] tracking-tight">원천업로드</span>
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "guide" ? "text-blue-600 font-bold scale-105" : "text-slate-400"
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] tracking-tight">양식가이드</span>
        </button>
      </nav>

      {/* Program Modal (Add / Edit) */}
      <ProgramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProgram}
        program={editingProgram}
        defaultYear={selectedYear}
        defaultSemester={selectedSemester}
      />

    </div>
  );
}
