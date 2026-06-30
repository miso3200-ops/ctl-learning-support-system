import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ExcelUploaderProps {
  uploadUrl: string;
  payloadExtra?: Record<string, any>;
  onSuccess?: (response: any) => void;
  title: string;
  description: string;
  id: string;
}

export default function ExcelUploader({
  uploadUrl,
  payloadExtra = {},
  onSuccess,
  title,
  description,
  id
}: ExcelUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;
    
    // Check extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls" && ext !== "csv") {
      setStatus("error");
      setMessage("올바른 Excel(.xlsx, .xls) 또는 CSV(.csv) 파일 형식이 아닙니다.");
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1];
        
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileBase64: base64String,
            ...payloadExtra
          })
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "파일이 성공적으로 업로드되었습니다.");
          if (onSuccess) onSuccess(data);
        } else {
          setStatus("error");
          setMessage(data.error || "업로드 처리 중 오류가 발생했습니다.");
        }
      };
      
      reader.onerror = () => {
        setLoading(false);
        setStatus("error");
        setMessage("파일을 읽는 과정에서 에러가 발생했습니다.");
      };

    } catch (err: any) {
      setLoading(false);
      setStatus("error");
      setMessage(err.message || "서버 통신 중 에러가 발생했습니다.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-gray-700">{title}</label>
        {status === "success" && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 완료됨
          </span>
        )}
      </div>

      <div
        id={id}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative w-full border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          isDragActive
            ? "border-blue-500 bg-blue-50/50"
            : status === "success"
            ? "border-emerald-300 bg-emerald-50/10"
            : status === "error"
            ? "border-rose-300 bg-rose-50/10"
            : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          disabled={loading}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-sm text-slate-500 font-medium">데이터 분석 및 매칭 진행 중...</span>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">{fileName}</p>
            <p className="text-xs text-slate-500">{message}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">클릭하여 다른 파일 업로드</p>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">업로드 실패</p>
            <p className="text-xs text-rose-600 max-w-md">{message}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">클릭하여 다시 시도</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-1">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              <span className="text-blue-650 font-semibold">클릭하여 파일을 선택</span>하거나 파일을 끌어서 놓으세요.
            </p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
