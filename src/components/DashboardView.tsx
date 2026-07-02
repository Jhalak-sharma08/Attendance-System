import { Course, Student, Session } from "../types";
import { getStudentAttendanceMetrics, getCourseAttendanceMetrics, getSystemWideMetrics } from "../utils";
import { BookOpen, Users, TrendingUp, AlertTriangle, Calendar, ChevronRight, GraduationCap } from "lucide-react";

interface DashboardViewProps {
  courses: Course[];
  students: Student[];
  sessions: Session[];
  onNavigate: (view: string, courseId?: string, studentId?: string) => void;
}

export default function DashboardView({ courses, students, sessions, onNavigate }: DashboardViewProps) {
  const totalCourses = courses.length;
  const totalStudents = students.length;
  const overallRate = getSystemWideMetrics(sessions);

  // Find students with attendance under 75%
  const atRiskStudents = students
    .map(student => {
      const metrics = getStudentAttendanceMetrics(student, sessions);
      return {
        student,
        metrics
      };
    })
    .filter(item => item.metrics.totalEligible > 0 && item.metrics.percentage < 75)
    .sort((a, b) => a.metrics.percentage - b.metrics.percentage);

  // Get course-wise attendance summaries
  const courseSummaries = courses.map(course => {
    const enrolledCount = students.filter(s => s.courseIds.includes(course.id)).length;
    const { percentage, totalSessions } = getCourseAttendanceMetrics(course.id, sessions, enrolledCount);
    return {
      course,
      percentage,
      totalSessions,
      enrolledCount
    };
  });

  // Get 4 most recent sessions
  const recentSessions = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fadeIn" id="dashboard-view">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Academic Overview</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor lecture session compliance, student roster attendance thresholds, and departmental summaries.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onNavigate("take-attendance")}
            className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-all cursor-pointer shadow-sm shadow-blue-600/10"
          >
            New Roll Call
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Courses</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCourses}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalStudents}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">College Attendance</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{overallRate}%</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">At-Risk Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{atRiskStudents.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Courses Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Course Compliance Summary</h3>
            <button
              onClick={() => onNavigate("courses")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
            >
              Manage Courses <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3 text-center">Sessions</th>
                  <th className="py-3 px-3 text-center">Enrolled</th>
                  <th className="py-3 px-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseSummaries.map(({ course, percentage, totalSessions, enrolledCount }) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{course.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{course.instructor}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-xs">{course.code}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{totalSessions}</td>
                    <td className="py-3 px-3 text-center font-medium text-slate-700">{enrolledCount}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={`font-semibold ${
                          percentage >= 85 ? "text-green-600" : percentage >= 75 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {percentage}%
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 85 ? "bg-green-500" : percentage >= 75 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {courseSummaries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No courses recorded yet. Add some in the Courses view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Alerts & Recent Sessions */}
        <div className="space-y-6">
          {/* At-Risk Warning Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" />
                <h3 className="text-base font-bold text-slate-900">Attendance Alerts</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-red-50 text-red-700 font-bold rounded-full border border-red-100">
                &lt; 75% Limit
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {atRiskStudents.map(({ student, metrics }) => (
                <div
                  key={student.id}
                  onClick={() => onNavigate("students", undefined, student.id)}
                  className="p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{student.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Roll No: {student.rollNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-600">{metrics.percentage}%</p>
                    <p className="text-[9px] text-slate-400">{metrics.absentCount} absents</p>
                  </div>
                </div>
              ))}
              {atRiskStudents.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  🎉 Good job! All students are currently above compliance threshold.
                </div>
              )}
            </div>
          </div>

          {/* Recent Roll Calls */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Recent Roll Calls</h3>

            <div className="space-y-3">
              {recentSessions.map(sess => {
                const course = courses.find(c => c.id === sess.courseId);
                const totalStudentsInSession = Object.keys(sess.attendance).length;
                const presents = Object.values(sess.attendance).filter(v => v === "present" || v === "late").length;
                const attendedRate = totalStudentsInSession > 0 ? Math.round((presents / totalStudentsInSession) * 100) : 0;

                return (
                  <div key={sess.id} className="p-3 bg-white hover:bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 flex items-start gap-3 transition-colors">
                    <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{sess.topic}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{course?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{sess.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {presents}/{totalStudentsInSession}
                      </span>
                      <p className="text-[9px] text-slate-400 mt-1">{attendedRate}% active</p>
                    </div>
                  </div>
                );
              })}
              {recentSessions.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No sessions conducted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
