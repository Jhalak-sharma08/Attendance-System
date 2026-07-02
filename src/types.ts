export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  department: string;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  courseIds: string[];
}

export interface Session {
  id: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  topic: string;
  attendance: Record<string, AttendanceStatus>;
}

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceAnalytics {
  totalSessions: number;
  overallAttendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}
