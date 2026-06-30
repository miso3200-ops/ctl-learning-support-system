import React, { useState } from "react";
import {
  FileSpreadsheet,
  Users,
  Award,
  CircleDollarSign,
  Star,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Program } from "../types";
import ExcelUploader from "./ExcelUploader";

interface ProgramAnalysisItem extends Program {
  participantsCount: number;
  warningCount: number;
  escapedCount: number;
  escapeRate: number;
  budgetPerStudent: number;
}

interface ProgramListProps {
  programs: ProgramAnalysisItem[];
  onEdit: (program: Program) => void;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
  year: number;
  semester: string;
}

export default function ProgramList({
  programs,
  onEdit,
  onDelete,
  onRefresh,
  year,
  semester
}: ProgramListProps) {
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedProgramId(expandedProgramId === id ? null : id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`실제 프로그램 [${name}]을 삭제하시겠습니까?\n해당 프로그램에 속한 학생 명단도 모두 함께 삭제됩니다.`)) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } catch (err) {
        alert("삭제 작업 중 에러가 발생했습니다.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">프로그램별 세부 분석 및 참여 대장</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {year}년도 {semester}에 개설된 교육 프로그램과 예산 효율성, 탈출 지표를 확인합니다.
          </p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-full">
          총 {programs.length}개 프로그램
        </span>
      </div>

      {programs.length === 0 ? (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
          <FileSpreadsheet className="w-10 h-10 text-gray-300" />
          <p className="text-sm font-medium">등록된 프로그램이 없습니다.</p>
          <p className="text-xs text-gray-400">우측 상단의 '+ 프로그램 추가' 버튼을 눌러 개설정보를 등록하세요.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {programs.map((prog) => {
            const isExpanded = expandedProgramId === prog.id;
            const isDeleting = deletingId === prog.id;

            return (
              <div
                key={prog.id}
                className={`transition-all duration-150 ${
                  isExpanded ? "bg-blue-50/10" : "hover:bg-slate-50/50"
                }`}
              >
                {/* Primary Card Row */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Info Column */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {prog.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        담당자: {prog.managerName}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                      {prog.name}
                    </h4>
                  </div>

                  {/* Metrics Columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 text-center sm:text-left min-w-[320px]">
                    
                    {/* Participants */}
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> 참여 실인원
                      </span>
                      <span className="text-base font-bold text-gray-900 mt-0.5">
                        {prog.participantsCount}명
                      </span>
                    </div>

                    {/* Escape Rate */}
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-600" /> 학사경고 탈출률
                      </span>
                      <span className="text-base font-bold text-emerald-700 mt-0.5">
                        {prog.warningCount > 0 ? (
                          <span className="flex items-baseline gap-1">
                            {prog.escapeRate.toFixed(1)}%
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({prog.escapedCount}/{prog.warningCount}명)
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-normal">해당없음</span>
                        )}
                      </span>
                    </div>

                    {/* Budget per Student */}
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <CircleDollarSign className="w-3.5 h-3.5 text-indigo-600" /> 인당 예산
                      </span>
                      <span className="text-base font-semibold text-gray-900 mt-0.5">
                        {prog.budgetPerStudent.toLocaleString("ko-KR")}원
                      </span>
                    </div>

                    {/* Satisfaction */}
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 만족도
                      </span>
                      <span className="text-base font-bold text-amber-600 mt-0.5">
                        {prog.satisfaction.toFixed(1)} / 5.0
                      </span>
                    </div>

                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 md:border-0 md:pt-0">
                    <button
                      onClick={() => onEdit(prog)}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition"
                      title="정보 수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prog.id, prog.name)}
                      disabled={isDeleting}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="프로그램 삭제"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleExpand(prog.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 rounded-lg transition"
                    >
                      명단 관리
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Section (Excel uploading and students list display) */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-200 bg-slate-50/30 flex flex-col gap-4 animate-in slide-in-from-top-1 duration-150">
                    <div className="p-4 bg-white rounded-lg border border-slate-200/60 shadow-xs">
                      <ExcelUploader
                        id={`uploader-participants-${prog.id}`}
                        uploadUrl="/api/upload-participants"
                        payloadExtra={{ programId: prog.id }}
                        title="참여 학생 명단 업로드"
                        description="대학 시스템에서 내려받은 학번, 성명, 학과, 이수여부 컬럼이 포함된 엑셀/CSV 데이터를 그대로 끌어다 놓으세요."
                        onSuccess={onRefresh}
                      />
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
