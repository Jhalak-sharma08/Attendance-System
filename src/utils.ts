import { Session, Student, AttendanceStatus } from "./types";

/**
 * Calculates attendance metrics for a specific student across their enrolled courses
 * Present = 1.0, Late = 0.5, Absent = 0.0
 */
export function getStudentAttendanceMetrics(
  student: Student,
  sessions: Session[]
) {
  let totalEligible = 0;
  let presentCount = 0;
  let lateCount = 0;
  let absentCount = 0;

  const courseBreakdown: Record<string, { total: number; attended: number; score: number }> = {};

  // Initialize breakdown for enrolled courses
  student.courseIds.forEach(cId => {
    courseBreakdown[cId] = { total: 0, attended: 0, score: 0 };
  });

  // Filter sessions that belong to the student's enrolled courses
  sessions.forEach(session => {
    if (student.courseIds.includes(session.courseId)) {
      const status = session.attendance[student.id];
      if (status) {
        totalEligible++;
        if (!courseBreakdown[session.courseId]) {
          courseBreakdown[session.courseId] = { total: 0, attended: 0, score: 0 };
        }
        courseBreakdown[session.courseId].total++;

        if (status === "present") {
          presentCount++;
          courseBreakdown[session.courseId].score += 1.0;
          courseBreakdown[session.courseId].attended++;
        } else if (status === "late") {
          lateCount++;
          courseBreakdown[session.courseId].score += 0.5;
          courseBreakdown[session.courseId].attended++; // Counted as attended, but score adjusted
        } else if (status === "absent") {
          absentCount++;
        }
      }
    }
  });

  const rawPercentage = totalEligible > 0 ? ((presentCount + lateCount * 0.5) / totalEligible) * 100 : 100;

  return {
    percentage: Math.round(rawPercentage),
    totalEligible,
    presentCount,
    lateCount,
    absentCount,
    courseBreakdown: Object.keys(courseBreakdown).map(courseId => {
      const b = courseBreakdown[courseId];
      return {
        courseId,
        total: b.total,
        attended: b.attended,
        percentage: b.total > 0 ? Math.round((b.score / b.total) * 100) : 100
      };
    })
  };
}

/**
 * Calculates overall average attendance rate for a single course
 */
export function getCourseAttendanceMetrics(
  courseId: string,
  sessions: Session[],
  enrolledStudentCount: number
) {
  const courseSessions = sessions.filter(s => s.courseId === courseId);
  if (courseSessions.length === 0 || enrolledStudentCount === 0) {
    return { percentage: 100, totalSessions: 0 };
  }

  let totalPossibleRecords = 0;
  let weightedAttendanceScore = 0;

  courseSessions.forEach(session => {
    Object.values(session.attendance).forEach(status => {
      totalPossibleRecords++;
      if (status === "present") {
        weightedAttendanceScore += 1.0;
      } else if (status === "late") {
        weightedAttendanceScore += 0.5;
      }
    });
  });

  const rawPercent = totalPossibleRecords > 0 ? (weightedAttendanceScore / totalPossibleRecords) * 100 : 100;
  return {
    percentage: Math.round(rawPercent),
    totalSessions: courseSessions.length
  };
}

/**
 * Calculates the overall college-wide average attendance rate across all sessions
 */
export function getSystemWideMetrics(sessions: Session[]) {
  if (sessions.length === 0) return 100;

  let totalRecords = 0;
  let weightedScore = 0;

  sessions.forEach(session => {
    Object.values(session.attendance).forEach(status => {
      totalRecords++;
      if (status === "present") {
        weightedScore += 1.0;
      } else if (status === "late") {
        weightedScore += 0.5;
      }
    });
  });

  return totalRecords > 0 ? Math.round((weightedScore / totalRecords) * 100) : 100;
}
