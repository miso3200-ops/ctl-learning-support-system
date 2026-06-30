import fs from "fs";
import path from "path";
import { Program, Participant, MasterStudent } from "../src/types";

const DB_PATH = path.join(process.cwd(), "db.json");

interface DBStore {
  programs: Program[];
  participants: Participant[];
  masterStudents: MasterStudent[];
}

// Initial Sample Data to make the dashboard look stunning out-of-the-box!
const INITIAL_STORE: DBStore = {
  programs: [
    // 2025 1학기
    { id: "p1", year: 2025, semester: "1학기", name: "학사경고 극복 1:1 튜터링", category: "학습컨설팅", managerName: "김철수", budget: 1500000, satisfaction: 4.2 },
    { id: "p2", year: 2025, semester: "1학기", name: "자기주도 학습동아리", category: "튜터링", managerName: "이영희", budget: 3000000, satisfaction: 4.5 },
    { id: "p3", year: 2025, semester: "1학기", name: "효과적인 시간관리 특강", category: "학습특강", managerName: "박민수", budget: 800000, satisfaction: 3.9 },
    // 2025 2학기
    { id: "p4", year: 2025, semester: "2학기", name: "A+ 학점 달성 멘토링", category: "튜터링", managerName: "최수진", budget: 2500000, satisfaction: 4.6 },
    { id: "p5", year: 2025, semester: "2학기", name: "학사경고 탈출 클리닉", category: "학습컨설팅", managerName: "김철수", budget: 1800000, satisfaction: 4.3 },
    { id: "p6", year: 2025, semester: "2학기", name: "대학 글쓰기 꿀팁 워크숍", category: "학습특강", managerName: "박민수", budget: 1200000, satisfaction: 4.1 },
    // 2026 1학기
    { id: "p7", year: 2026, semester: "1학기", name: "학습 부진학생 집중 컨설팅", category: "학습컨설팅", managerName: "김철수", budget: 2000000, satisfaction: 4.4 },
    { id: "p8", year: 2026, semester: "1학기", name: "러닝 커뮤니티(그룹 학습)", category: "튜터링", managerName: "이영희", budget: 3500000, satisfaction: 4.7 },
    { id: "p9", year: 2026, semester: "1학기", name: "AI 활용 스마트 학습법 특강", category: "학습특강", managerName: "최수진", budget: 1000000, satisfaction: 4.8 }
  ],
  participants: [
    // p1 (학사경고 극복 튜터링 2025-1)
    { id: "pt1", programId: "p1", studentId: "20231001", studentName: "강민우", department: "컴퓨터공학과", isCompleted: true },
    { id: "pt2", programId: "p1", studentId: "20231002", studentName: "김지아", department: "경영학과", isCompleted: true },
    { id: "pt3", programId: "p1", studentId: "20231003", studentName: "박태양", department: "기계공학과", isCompleted: true },
    { id: "pt4", programId: "p1", studentId: "20231004", studentName: "이지수", department: "전자공학과", isCompleted: false },
    // p2 (자기주도 학습동아리 2025-1)
    { id: "pt5", programId: "p2", studentId: "20241001", studentName: "최영민", department: "컴퓨터공학과", isCompleted: true },
    { id: "pt6", programId: "p2", studentId: "20241002", studentName: "정다은", department: "영어영문학과", isCompleted: true },
    { id: "pt7", programId: "p2", studentId: "20241003", studentName: "임재원", department: "경영학과", isCompleted: true },
    // p3 (시간관리 특강 2025-1)
    { id: "pt8", programId: "p3", studentId: "20241001", studentName: "최영민", department: "컴퓨터공학과", isCompleted: true }, // 중복 참여자 테스트용
    { id: "pt9", programId: "p3", studentId: "20231005", studentName: "한동희", department: "화학공학과", isCompleted: true },
    
    // p4 (멘토링 2025-2)
    { id: "pt10", programId: "p4", studentId: "20241002", studentName: "정다은", department: "영어영문학과", isCompleted: true },
    { id: "pt11", programId: "p4", studentId: "20231006", studentName: "송민재", department: "컴퓨터공학과", isCompleted: true },
    { id: "pt12", programId: "p4", studentId: "20231007", studentName: "윤하영", department: "산업디자인과", isCompleted: true },
    // p5 (탈출 클리닉 2025-2)
    { id: "pt13", programId: "p5", studentId: "20231001", studentName: "강민우", department: "컴퓨터공학과", isCompleted: true }, // 직전 2025-1 학사경고였다고 침
    { id: "pt14", programId: "p5", studentId: "20231008", studentName: "오상원", department: "전자공학과", isCompleted: true },
    { id: "pt15", programId: "p5", studentId: "20231009", studentName: "신지혜", department: "수학과", isCompleted: true },
    { id: "pt16", programId: "p5", studentId: "20231010", studentName: "황정민", department: "신소재공학과", isCompleted: true },

    // p7 (학습부진 컨설팅 2026-1)
    { id: "pt17", programId: "p7", studentId: "20231008", studentName: "오상원", department: "전자공학과", isCompleted: true },
    { id: "pt18", programId: "p7", studentId: "20231009", studentName: "신지혜", department: "수학과", isCompleted: true },
    { id: "pt19", programId: "p7", studentId: "20231011", studentName: "류진아", department: "심리학과", isCompleted: true },
    { id: "pt20", programId: "p7", studentId: "20231012", studentName: "고태우", department: "기계공학과", isCompleted: true },
    // p8 (러닝 커뮤니티 2026-1)
    { id: "pt21", programId: "p8", studentId: "20241001", studentName: "최영민", department: "컴퓨터공학과", isCompleted: true },
    { id: "pt22", programId: "p8", studentId: "20251001", studentName: "서현우", department: "경영학과", isCompleted: true },
    { id: "pt23", programId: "p8", studentId: "20251002", studentName: "이유나", department: "생명공학과", isCompleted: true },
    { id: "pt24", programId: "p8", studentId: "20251003", studentName: "안재현", department: "행정학과", isCompleted: true }
  ],
  masterStudents: [
    // 2025 1학기 재학생 대장 (일부분만, 분모는 별도 총합으로 카운트하되 학번 매칭 테스트용)
    { studentId: "20231001", studentName: "강민우", year: 2025, semester: "1학기", hasAcademicWarning: true, gpa: 1.52, enrollmentStatus: "재학" },
    { studentId: "20231002", studentName: "김지아", year: 2025, semester: "1학기", hasAcademicWarning: true, gpa: 1.84, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20231003", studentName: "박태양", year: 2025, semester: "1학기", hasAcademicWarning: true, gpa: 1.78, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20231004", studentName: "이지수", year: 2025, semester: "1학기", hasAcademicWarning: true, gpa: 1.21, enrollmentStatus: "재학" }, // 미탈출
    { studentId: "20241001", studentName: "최영민", year: 2025, semester: "1학기", hasAcademicWarning: false, gpa: 3.45, enrollmentStatus: "재학" },
    { studentId: "20241002", studentName: "정다은", year: 2025, semester: "1학기", hasAcademicWarning: false, gpa: 4.12, enrollmentStatus: "재학" },
    { studentId: "20241003", studentName: "임재원", year: 2025, semester: "1학기", hasAcademicWarning: false, gpa: 2.88, enrollmentStatus: "재학" },
    { studentId: "20231005", studentName: "한동희", year: 2025, semester: "1학기", hasAcademicWarning: false, gpa: 3.20, enrollmentStatus: "재학" },

    // 2025 2학기 재학생 대장
    { studentId: "20231001", studentName: "강민우", year: 2025, semester: "2학기", hasAcademicWarning: true, gpa: 1.95, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20231008", studentName: "오상원", year: 2025, semester: "2학기", hasAcademicWarning: true, gpa: 1.81, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20231009", studentName: "신지혜", year: 2025, semester: "2학기", hasAcademicWarning: true, gpa: 1.62, enrollmentStatus: "재학" }, // 미탈출
    { studentId: "20231010", studentName: "황정민", year: 2025, semester: "2학기", hasAcademicWarning: true, gpa: 2.05, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20241002", studentName: "정다은", year: 2025, semester: "2학기", hasAcademicWarning: false, gpa: 3.90, enrollmentStatus: "재학" },
    { studentId: "20231006", studentName: "송민재", year: 2025, semester: "2학기", hasAcademicWarning: false, gpa: 3.11, enrollmentStatus: "재학" },
    { studentId: "20231007", studentName: "윤하영", year: 2025, semester: "2학기", hasAcademicWarning: false, gpa: 3.55, enrollmentStatus: "재학" },

    // 2026 1학기 재학생 대장
    { studentId: "20231008", studentName: "오상원", year: 2026, semester: "1학기", hasAcademicWarning: false, gpa: 2.45, enrollmentStatus: "재학" },
    { studentId: "20231009", studentName: "신지혜", year: 2026, semester: "1학기", hasAcademicWarning: true, gpa: 1.88, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20231011", studentName: "류진아", year: 2026, semester: "1학기", hasAcademicWarning: true, gpa: 1.91, enrollmentStatus: "재학" }, // 탈출!
    { studentId: "20231012", studentName: "고태우", year: 2026, semester: "1학기", hasAcademicWarning: true, gpa: 1.45, enrollmentStatus: "재학" }, // 미탈출
    { studentId: "20241001", studentName: "최영민", year: 2026, semester: "1학기", hasAcademicWarning: false, gpa: 3.60, enrollmentStatus: "재학" },
    { studentId: "20251001", studentName: "서현우", year: 2026, semester: "1학기", hasAcademicWarning: false, gpa: 3.82, enrollmentStatus: "재학" },
    { studentId: "20251002", studentName: "이유나", year: 2026, semester: "1학기", hasAcademicWarning: false, gpa: 2.95, enrollmentStatus: "재학" },
    { studentId: "20251003", studentName: "안재현", year: 2026, semester: "1학기", hasAcademicWarning: false, gpa: 3.40, enrollmentStatus: "재학" }
  ]
};

// Add general enrollment denominators per semester for accuracy (since master student lists above are just samples,
// we can define standard denominators or dynamically count '재학' students. Let's make sure that if a dynamic count
// is used, we have a pool of total enrolled students. For realistic percentages, we can assume a standard 
// total enrollment count of 800 for 2025-1, 820 for 2025-2, and 850 for 2026-1, or dynamically use the MasterStudent table
// count. Let's make it so if MasterStudent count is small, we fallback to a realistic total or use the actual count.)
export const SEMESTER_TOTAL_ENROLLED: Record<string, number> = {
  "2025_1학기": 120,
  "2025_2학기": 125,
  "2026_1학기": 130
};

export function getDB(): DBStore {
  if (!fs.existsSync(DB_PATH)) {
    saveDB(INITIAL_STORE);
    return INITIAL_STORE;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read DB, returning initial store:", err);
    return INITIAL_STORE;
  }
}

export function saveDB(data: DBStore): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write DB:", err);
  }
}
