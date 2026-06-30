import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Program } from "../types";

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (programData: any) => Promise<void>;
  program?: Program | null; // If editing, pass program; if adding, pass null
  defaultYear: number;
  defaultSemester: string;
}

export default function ProgramModal({
  isOpen,
  onClose,
  onSave,
  program = null,
  defaultYear,
  defaultSemester
}: ProgramModalProps) {
  const [year, setYear] = useState(defaultYear);
  const [semester, setSemester] = useState(defaultSemester);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("튜터링");
  const [managerName, setManagerName] = useState("김철수");
  const [budget, setBudget] = useState("");
  const [satisfaction, setSatisfaction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (program) {
      setYear(program.year);
      setSemester(program.semester);
      setName(program.name);
      setCategory(program.category);
      setManagerName(program.managerName);
      setBudget(program.budget.toString());
      setSatisfaction(program.satisfaction.toString());
    } else {
      setYear(defaultYear);
      setSemester(defaultSemester);
      setName("");
      setCategory("튜터링");
      setManagerName("김철수");
      setBudget("");
      setSatisfaction("");
    }
    setError("");
  }, [program, isOpen, defaultYear, defaultSemester]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("프로그램명을 입력해 주세요.");
      return;
    }

    const satVal = Number(satisfaction);
    if (satisfaction !== "" && (isNaN(satVal) || satVal < 0 || satVal > 5)) {
      setError("만족도는 0에서 5 사이의 점수여야 합니다.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: program?.id,
        year,
        semester,
        name: name.trim(),
        category,
        managerName,
        budget: Number(budget) || 0,
        satisfaction: Number(satisfaction) || 0
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {program ? "프로그램 정보 수정" : "새 프로그램 등록"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-100 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">운영 연도</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
              >
                <option value={2024}>2024년</option>
                <option value={2025}>2025년</option>
                <option value={2026}>2026년</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">운영 학기</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="1학기">1학기</option>
                <option value="2학기">2학기</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">프로그램명</label>
            <input
              type="text"
              placeholder="예: 학업경고 극복 튜터링"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">프로그램 분류</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="튜터링">튜터링</option>
                <option value="학습특강">학습특강</option>
                <option value="학습컨설팅">학습컨설팅</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">담당자명</label>
              <select
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
              >
                <option value="김철수">김철수 (컨설팅)</option>
                <option value="이영희">이영희 (튜터링)</option>
                <option value="박민수">박민수 (특강)</option>
                <option value="최수진">최수진 (특강/공동체)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">소요 예산 (원)</label>
              <input
                type="number"
                placeholder="예: 1500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">만족도 평점 (5.0 만점)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="예: 4.5"
                value={satisfaction}
                onChange={(e) => setSatisfaction(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold shadow-xs flex items-center gap-1.5 transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
