export interface Program {
  id: string;
  year: number;
  semester: string; // "1학기" | "2학기"
  name: string;
  category: string; // "튜터링" | "학습특강" | "학습컨설팅" | "기타"
  managerName: string; // "김철수" | "이영희" | "박민수" | "최수진"
  budget: number;
  satisfaction: number; // 0 ~ 5.0
}

export interface Participant {
  id: string;
  programId: string;
  studentId: string;
  studentName: string;
  department: string;
  isCompleted: boolean;
}

export interface MasterStudent {
  studentId: string;
  studentName: string;
  year: number;
  semester: string; // "1학기" | "2학기"
  hasAcademicWarning: boolean; // 직전학기 학사경고 여부
  gpa: number; // 당해학기 GPA (0 ~ 4.5)
  enrollmentStatus: string; // "재학" | "휴학"
}

export interface DashboardMetrics {
  totalEnrolledCount: number;
  totalParticipantsCount: number; // 중복 포함
  uniqueParticipantsCount: number; // 중복 제외 실인원
  participationRate: number; // uniqueParticipantsCount / totalEnrolledCount * 100
  warningStudentsCount: number; // 학사경고 대상 프로그램 참여자 수
  warningEscapedCount: number; // 그 중 이번 학기 GPA >= 1.75인 수
  warningEscapeRate: number; // warningEscapedCount / warningStudentsCount * 100
  averageSatisfaction: number;
  totalBudget: number;
}
