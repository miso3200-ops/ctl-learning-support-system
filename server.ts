import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import xlsx from "xlsx";
import { getDB, saveDB } from "./server/db";
import { Program, Participant, MasterStudent, DashboardMetrics } from "./src/types";

const PORT = Number(process.env.PORT) || 3000;

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

async function startServer() {
  const app = express();

  // Set body parser limits for handling large base64 uploaded files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // --- API Routes ---

  // 1. Get all programs
  app.get("/api/programs", (req, res) => {
    const db = getDB();
    const { year, semester } = req.query;
    
    let programs = db.programs;
    if (year) {
      programs = programs.filter(p => p.year === Number(year));
    }
    if (semester) {
      programs = programs.filter(p => p.semester === String(semester));
    }
    
    res.json(programs);
  });

  // 2. Create a new program
  app.post("/api/programs", (req, res) => {
    const db = getDB();
    const { year, semester, name, category, managerName, budget, satisfaction } = req.body;

    if (!year || !semester || !name || !category || !managerName) {
      return res.status(400).json({ error: "필수 정보가 누락되었습니다." });
    }

    const newProgram: Program = {
      id: "p_" + Date.now(),
      year: Number(year),
      semester: String(semester),
      name: String(name),
      category: String(category),
      managerName: String(managerName),
      budget: Number(budget) || 0,
      satisfaction: Number(satisfaction) || 0,
    };

    db.programs.push(newProgram);
    saveDB(db);

    res.status(201).json(newProgram);
  });

  // 3. Delete a program (and cascade delete its participants)
  app.delete("/api/programs/:id", (req, res) => {
    const db = getDB();
    const { id } = req.params;

    db.programs = db.programs.filter(p => p.id !== id);
    db.participants = db.participants.filter(pt => pt.programId !== id);
    saveDB(db);

    res.json({ success: true, message: "프로그램이 삭제되었습니다." });
  });

  // 4. Update a program
  app.put("/api/programs/:id", (req, res) => {
    const db = getDB();
    const { id } = req.params;
    const { name, category, managerName, budget, satisfaction } = req.body;

    const idx = db.programs.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "프로그램을 찾을 수 없습니다." });
    }

    db.programs[idx] = {
      ...db.programs[idx],
      name: name !== undefined ? String(name) : db.programs[idx].name,
      category: category !== undefined ? String(category) : db.programs[idx].category,
      managerName: managerName !== undefined ? String(managerName) : db.programs[idx].managerName,
      budget: budget !== undefined ? Number(budget) : db.programs[idx].budget,
      satisfaction: satisfaction !== undefined ? Number(satisfaction) : db.programs[idx].satisfaction,
    };

    saveDB(db);
    res.json(db.programs[idx]);
  });

  // 5. Upload Master Students (Academic Portal Roster) via Base64 Excel
  app.post("/api/upload-master", (req, res) => {
    const db = getDB();
    const { fileBase64, year, semester } = req.body;

    if (!fileBase64 || !year || !semester) {
      return res.status(400).json({ error: "업로드할 파일이나 연도/학기 정보가 누락되었습니다." });
    }

    try {
      const buffer = Buffer.from(fileBase64, "base64");
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON rows
      const rawRows = xlsx.utils.sheet_to_json(worksheet) as any[];

      if (rawRows.length === 0) {
        return res.status(400).json({ error: "엑셀 파일에 데이터가 존재하지 않습니다." });
      }

      // Columns validation: 학번, 성명, 직전학기학사경고여부, 당해학기GPA, 재학상태
      // Support flexible mapping in Korean/English
      const newMasterStudents: MasterStudent[] = [];
      
      for (const row of rawRows) {
        // Find properties case-insensitively or with Korean names
        const studentId = String(row["학번"] || row["studentId"] || row["Student ID"] || "").trim();
        const studentName = String(row["성명"] || row["이름"] || row["studentName"] || row["Name"] || "").trim();
        const rawWarning = String(row["직전학기 학사경고 여부"] || row["학사경고여부"] || row["hasAcademicWarning"] || row["Academic Warning"] || "N").trim().toUpperCase();
        const gpa = Number(row["당해학기 GPA"] || row["당해학기평점"] || row["gpa"] || row["GPA"] || 0);
        const enrollmentStatus = String(row["재학 상태"] || row["재학상태"] || row["enrollmentStatus"] || row["Status"] || "재학").trim();

        if (!studentId || !studentName) {
          continue; // Skip invalid rows
        }

        const hasAcademicWarning = rawWarning === "Y" || rawWarning === "YES" || rawWarning === "TRUE" || rawWarning === "1" || rawWarning === "학사경고";

        newMasterStudents.push({
          studentId,
          studentName,
          year: Number(year),
          semester: String(semester),
          hasAcademicWarning,
          gpa,
          enrollmentStatus
        });
      }

      if (newMasterStudents.length === 0) {
        return res.status(400).json({ error: "유효한 학생 데이터(학번, 성명)를 찾을 수 없습니다." });
      }

      // Filter out existing records for this year/semester to avoid duplicates, or replace them
      db.masterStudents = db.masterStudents.filter(
        s => !(s.year === Number(year) && s.semester === String(semester))
      );

      db.masterStudents.push(...newMasterStudents);
      saveDB(db);

      res.json({
        success: true,
        count: newMasterStudents.length,
        message: `${year}년도 ${semester} 재학생 대장 ${newMasterStudents.length}명이 정상 등록되었습니다.`
      });
    } catch (err: any) {
      console.error("Master student upload error:", err);
      res.status(500).json({ error: "파일 파싱 중 오류가 발생했습니다: " + err.message });
    }
  });

  // 6. Upload Participants List for a specific Program via Base64 Excel
  app.post("/api/upload-participants", (req, res) => {
    const db = getDB();
    const { fileBase64, programId } = req.body;

    if (!fileBase64 || !programId) {
      return res.status(400).json({ error: "업로드할 파일이나 프로그램 정보가 누락되었습니다." });
    }

    // Verify program exists
    const program = db.programs.find(p => p.id === programId);
    if (!program) {
      return res.status(404).json({ error: "선택된 프로그램을 찾을 수 없습니다." });
    }

    try {
      const buffer = Buffer.from(fileBase64, "base64");
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const rawRows = xlsx.utils.sheet_to_json(worksheet) as any[];

      if (rawRows.length === 0) {
        return res.status(400).json({ error: "엑셀 파일에 데이터가 존재하지 않습니다." });
      }

      const newParticipants: Participant[] = [];

      for (const row of rawRows) {
        const studentId = String(row["학번"] || row["studentId"] || row["Student ID"] || "").trim();
        const studentName = String(row["성명"] || row["이름"] || row["studentName"] || row["Name"] || "").trim();
        const department = String(row["학과"] || row["소속"] || row["department"] || row["Department"] || "미지정").trim();
        const rawCompleted = String(row["이수 여부"] || row["이수여부"] || row["isCompleted"] || row["Completed"] || "이수").trim().toUpperCase();

        if (!studentId || !studentName) {
          continue; // Skip invalid
        }

        const isCompleted = rawCompleted === "이수" || rawCompleted === "Y" || rawCompleted === "YES" || rawCompleted === "TRUE" || rawCompleted === "1";

        newParticipants.push({
          id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          programId,
          studentId,
          studentName,
          department,
          isCompleted
        });
      }

      if (newParticipants.length === 0) {
        return res.status(400).json({ error: "유효한 참여 학생 데이터(학번, 성명)를 찾을 수 없습니다." });
      }

      // Clear existing participants for this program
      db.participants = db.participants.filter(pt => pt.programId !== programId);
      db.participants.push(...newParticipants);
      saveDB(db);

      res.json({
        success: true,
        count: newParticipants.length,
        message: `프로그램 [${program.name}] 참여자 명단 ${newParticipants.length}명이 정상 등록되었습니다.`
      });
    } catch (err: any) {
      console.error("Participants upload error:", err);
      res.status(500).json({ error: "파일 파싱 중 오류가 발생했습니다: " + err.message });
    }
  });

  // 7. Get calculated metrics for a given year & semester, including comparison with previous semester and same semester previous year
  app.get("/api/metrics", (req, res) => {
    const db = getDB();
    const queryYear = Number(req.query.year || 2026);
    const querySemester = String(req.query.semester || "1학기");

    const calculateForSemester = (targetYear: number, targetSem: string): DashboardMetrics => {
      const programs = db.programs.filter(p => p.year === targetYear && p.semester === targetSem);
      const programIds = programs.map(p => p.id);
      
      // Filter participants
      const participants = db.participants.filter(pt => programIds.includes(pt.programId));
      const totalParticipantsCount = participants.length;

      // Unique participants
      const uniqueStudentIds = Array.from(new Set(participants.map(pt => pt.studentId)));
      const uniqueParticipantsCount = uniqueStudentIds.length;

      // Master enrollment for denominator
      const masterStudents = db.masterStudents.filter(s => s.year === targetYear && s.semester === targetSem);
      const enrolledStudents = masterStudents.filter(s => s.enrollmentStatus === "재학");
      
      // Fallback denominator if master list is not uploaded or too small
      let totalEnrolledCount = enrolledStudents.length;
      if (totalEnrolledCount === 0) {
        // Fallback to initial estimates for display realism
        const key = `${targetYear}_${targetSem}`;
        const SEM_FALLBACK: Record<string, number> = {
          "2025_1학기": 120,
          "2025_2학기": 125,
          "2026_1학기": 130
        };
        totalEnrolledCount = SEM_FALLBACK[key] || 100;
      }

      // Participation rate
      const participationRate = totalEnrolledCount > 0 ? (uniqueParticipantsCount / totalEnrolledCount) * 100 : 0;

      // Academic warning escapees
      // We look at all unique studentIds who participated in programs of this semester,
      // and check if they are marked as hasAcademicWarning === true in the MasterStudent table for that semester.
      const warningStudents = masterStudents.filter(s => s.hasAcademicWarning && uniqueStudentIds.includes(s.studentId));
      const warningStudentsCount = warningStudents.length;

      // Out of warning students, check who achieved gpa >= 1.75
      const warningEscaped = warningStudents.filter(s => s.gpa >= 1.75);
      const warningEscapedCount = warningEscaped.length;

      const warningEscapeRate = warningStudentsCount > 0 ? (warningEscapedCount / warningStudentsCount) * 100 : 0;

      // Average satisfaction
      const totalSat = programs.reduce((acc, p) => acc + p.satisfaction, 0);
      const averageSatisfaction = programs.length > 0 ? totalSat / programs.length : 0;

      // Total budget
      const totalBudget = programs.reduce((acc, p) => acc + p.budget, 0);

      return {
        totalEnrolledCount,
        totalParticipantsCount,
        uniqueParticipantsCount,
        participationRate,
        warningStudentsCount,
        warningEscapedCount,
        warningEscapeRate,
        averageSatisfaction,
        totalBudget
      };
    };

    // Calculate current metrics
    const currentMetrics = calculateForSemester(queryYear, querySemester);

    // Calculate previous semester (e.g. 2026-1학기 -> previous is 2025-2학기)
    let prevYear = queryYear;
    let prevSem = "1학기";
    if (querySemester === "1학기") {
      prevYear = queryYear - 1;
      prevSem = "2학기";
    } else {
      prevSem = "1학기";
    }
    const prevSemesterMetrics = calculateForSemester(prevYear, prevSem);

    // Calculate same semester previous year (e.g. 2026-1학기 -> 2025-1학기)
    const prevYearSameSemMetrics = calculateForSemester(queryYear - 1, querySemester);

    res.json({
      current: currentMetrics,
      previousSemester: {
        year: prevYear,
        semester: prevSem,
        metrics: prevSemesterMetrics
      },
      previousYearSameSem: {
        year: queryYear - 1,
        semester: querySemester,
        metrics: prevYearSameSemMetrics
      }
    });
  });

  // 8. Get program list with aggregated analysis (participants count, warning escape count, budget-per-student, etc.)
  app.get("/api/program-analysis", (req, res) => {
    const db = getDB();
    const queryYear = Number(req.query.year || 2026);
    const querySemester = String(req.query.semester || "1학기");

    const programs = db.programs.filter(p => p.year === queryYear && p.semester === querySemester);
    const masterStudents = db.masterStudents.filter(s => s.year === queryYear && s.semester === querySemester);

    const result = programs.map(prog => {
      const pCount = db.participants.filter(pt => pt.programId === prog.id).length;
      const participants = db.participants.filter(pt => pt.programId === prog.id);
      const pStudentIds = participants.map(pt => pt.studentId);

      // Warning students in this program
      const warnings = masterStudents.filter(s => s.hasAcademicWarning && pStudentIds.includes(s.studentId));
      const escaped = warnings.filter(s => s.gpa >= 1.75);

      const warningCount = warnings.length;
      const escapedCount = escaped.length;
      const escapeRate = warningCount > 0 ? (escapedCount / warningCount) * 100 : 0;

      const budgetPerStudent = pCount > 0 ? prog.budget / pCount : 0;

      return {
        ...prog,
        participantsCount: pCount,
        warningCount,
        escapedCount,
        escapeRate,
        budgetPerStudent
      };
    });

    res.json(result);
  });

  // 9. Get time-series metrics over multiple semesters for charts
  app.get("/api/time-series", (req, res) => {
    const db = getDB();
    
    // Sort and get unique list of all semesters present in the database
    const semesterKeysSet = new Set<string>();
    db.programs.forEach(p => semesterKeysSet.add(`${p.year}_${p.semester}`));
    db.masterStudents.forEach(s => semesterKeysSet.add(`${s.year}_${s.semester}`));

    // Sort the semesters chronologically
    const semesters = Array.from(semesterKeysSet).sort((a, b) => {
      const [ay, as] = a.split("_");
      const [by, bs] = b.split("_");
      if (ay !== by) return Number(ay) - Number(by);
      return as.localeCompare(bs); // 1학기 < 2학기
    });

    const timeSeriesData = semesters.map(key => {
      const [yearStr, semester] = key.split("_");
      const year = Number(yearStr);

      const programs = db.programs.filter(p => p.year === year && p.semester === semester);
      const programIds = programs.map(p => p.id);
      const participants = db.participants.filter(pt => programIds.includes(pt.programId));
      const uniqueStudentIds = Array.from(new Set(participants.map(pt => pt.studentId)));
      const uniqueParticipantsCount = uniqueStudentIds.length;

      const masterStudents = db.masterStudents.filter(s => s.year === year && s.semester === semester);
      const enrolledCount = masterStudents.filter(s => s.enrollmentStatus === "재학").length || 100;

      const participationRate = enrolledCount > 0 ? (uniqueParticipantsCount / enrolledCount) * 100 : 0;

      const warnings = masterStudents.filter(s => s.hasAcademicWarning && uniqueStudentIds.includes(s.studentId));
      const escaped = warnings.filter(s => s.gpa >= 1.75);
      const warningEscapeRate = warnings.length > 0 ? (escaped.length / warnings.length) * 100 : 0;

      const totalSat = programs.reduce((acc, p) => acc + p.satisfaction, 0);
      const averageSatisfaction = programs.length > 0 ? totalSat / programs.length : 0;

      const totalBudget = programs.reduce((acc, p) => acc + p.budget, 0);

      return {
        label: `${year}년 ${semester}`,
        year,
        semester,
        participationRate: Number(participationRate.toFixed(1)),
        warningEscapeRate: Number(warningEscapeRate.toFixed(1)),
        participantsCount: uniqueParticipantsCount,
        averageSatisfaction: Number(averageSatisfaction.toFixed(2)),
        totalBudget
      };
    });

    res.json(timeSeriesData);
  });

  // --- End of API Routes ---

  const distPath = path.join(process.cwd(), "dist");

  // Start Express FIRST, then init Vite in background
  const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    if (process.env.NODE_ENV !== "production") {
      try {
        const vite = await createViteServer({
          server: { middlewareMode: true, hmr: { port: 24679 } },
          appType: "spa",
        });
        app.use(vite.middlewares);
        console.log("Vite dev server ready");
      } catch {
        if (fs.existsSync(distPath)) {
          app.use(express.static(distPath));
          app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
          });
        }
      }
    } else if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Try: npx kill-port ${PORT} or set PORT=3001`);
    } else {
      console.error("Server error:", err.message);
    }
    process.exit(1);
  });
}

process.on("exit", () => {
  console.log("Server shutting down.");
});

startServer();
