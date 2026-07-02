import { useState } from "react";
import { Course, Student, Session } from "../types";
import { getStudentAttendanceMetrics } from "../utils";
import { GraduationCap, Mail, AlertTriangle, CheckCircle, Clock, XCircle, Search, Calendar } from "lucide-react";

interface StudentPortalViewProps {
  courses: Course[];
  students: Student[];
  sessions: Session[];
}

export default function StudentPortalView({ courses, students, sessions }: StudentPortalViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const metrics = activeStudent ? getStudentAttendanceMetrics(activeStudent, sessions) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" id="student-portal-view">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-600/10">
          <GraduationCap size={18} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans">Student Portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">Lookup private attendance credentials and session archives.</p>
        </div>
      </div>

      {/* Selector card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Identify Student Account
        </label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">-- Choose student profile to login --</option>
            {students.map(stud => (
              <option key={stud.id} value={stud.id}>
                {stud.name} ({stud.rollNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Student Profile details */}
      {activeStudent && metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left stats card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 h-fit md:col-span-1">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-16 h-16 bg-blue-50 text-blue-700 font-black text-xl rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                {activeStudent.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{activeStudent.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono font-bold uppercase tracking-wider bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded inline-block">{activeStudent.rollNumber}</p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1 font-mono">
                <Mail size={12} className="text-slate-400" /> {activeStudent.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Overall Compliance Rate
                </p>
                <p className={`text-4xl font-black mt-2 tracking-tight ${
                  metrics.percentage >= 85
                    ? "text-green-600"
                    : metrics.percentage >= 75
                    ? "text-amber-500"
                    : "text-red-600"
                }`}>
                  {metrics.percentage}%
                </p>
              </div>

              {/* Warnings and alerts */}
              {metrics.percentage >= 75 ? (
                <div className="p-3.5 bg-green-50 rounded-lg border border-green-100 text-center space-y-1">
                  <div className="flex justify-center text-green-600 mb-1">
                    <CheckCircle size={18} />
                  </div>
                  <p className="text-xs font-bold text-green-950">Roster Attendance Valid</p>
                  <p className="text-[10px] text-green-700 leading-normal">
                    You meet the university's 75% minimum classroom attendance requirements. Keep attending!
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-red-50 rounded-lg border border-red-100 text-center space-y-1">
                  <div className="flex justify-center text-red-600 mb-1">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-xs font-bold text-red-950">Debarment Warning</p>
                  <p className="text-[10px] text-red-700 leading-normal">
                    Your attendance is below the university-mandated 75% limit. You may be debarred from taking final examinations if rates don't recover.
                  </p>
                </div>
              )}

              {/* Status tally counters */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-green-600 font-bold text-base">{metrics.presentCount}</span>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Present</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-amber-500 font-bold text-base">{metrics.lateCount}</span>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Late</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-red-600 font-bold text-base">{metrics.absentCount}</span>
                  <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Absent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right logs detail panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrolled Course Summaries</h3>
              <p className="text-xs text-slate-500 mt-0.5">Breakdown of performance in individual subject lectures.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.courseBreakdown.map(b => {
                const course = courses.find(c => c.id === b.courseId);
                return (
                  <div key={b.courseId} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                        {course?.code || b.courseId}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-2.5 leading-tight truncate">
                        {course?.name || b.courseId}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{course?.instructor}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-semibold">({b.attended}/{b.total} lectures)</span>
                      <span className={`text-sm font-black ${
                        b.percentage >= 85 ? "text-green-600" : b.percentage >= 75 ? "text-amber-500" : "text-red-600"
                      }`}>
                        {b.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comprehensive Roll Call Ledger */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Chronological Roll Call Log</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {sessions
                  .filter(s => activeStudent.courseIds.includes(s.courseId))
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(session => {
                    const status = session.attendance[activeStudent.id];
                    if (!status) return null;

                    const course = courses.find(c => c.id === session.courseId);

                    return (
                      <div key={session.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            status === "present"
                              ? "bg-green-50 text-green-600 border border-green-100"
                              : status === "late"
                              ? "bg-amber-50 text-amber-500 border border-amber-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{session.topic}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                              {session.date} • <strong className="font-mono text-[9px] bg-slate-100 border border-slate-200/50 px-1 py-0.5 rounded text-slate-600">{course?.code || session.courseId}</strong>
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                          status === "present"
                            ? "bg-green-50 text-green-800 border border-green-100"
                            : status === "late"
                            ? "bg-amber-50 text-amber-800 border border-amber-100"
                            : "bg-red-50 text-red-800 border border-red-100"
                        }`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-16 text-center text-slate-400 text-xs">
          <GraduationCap size={44} className="mx-auto text-slate-300 mb-2" strokeWidth={1} />
          <p className="font-semibold text-slate-600">Secure Access Point</p>
          <p className="text-slate-400 mt-1">Please pick your registered name from the account picker to request logs.</p>
        </div>
      )}
    </div>
  );
}
