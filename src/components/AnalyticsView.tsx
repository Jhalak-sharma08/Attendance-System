import { useState } from "react";
import { Course, Student, Session, AttendanceStatus } from "../types";
import { getCourseAttendanceMetrics } from "../utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { TrendingUp, FileSpreadsheet, Percent, Calendar, Award } from "lucide-react";

interface AnalyticsViewProps {
  courses: Course[];
  students: Student[];
  sessions: Session[];
}

export default function AnalyticsView({ courses, students, sessions }: AnalyticsViewProps) {
  const [activeCourseId, setActiveCourseId] = useState("");

  // Filter sessions if single course is chosen
  const filteredSessions = activeCourseId
    ? sessions.filter(s => s.courseId === activeCourseId)
    : sessions;

  // Calculate aggregate counts of Present, Absent, Late
  let totalPresent = 0;
  let totalLate = 0;
  let totalAbsent = 0;

  filteredSessions.forEach(s => {
    Object.values(s.attendance).forEach((status) => {
      if (status === "present") totalPresent++;
      else if (status === "late") totalLate++;
      else if (status === "absent") totalAbsent++;
    });
  });

  const totalRecords = totalPresent + totalLate + totalAbsent;
  const attendanceRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate * 0.5) / totalRecords) * 100) : 100;

  // 1. Data for Subject Comparison Bar Chart
  const courseChartData = courses.map(course => {
    const enrolledStudents = students.filter(s => s.courseIds.includes(course.id));
    const metrics = getCourseAttendanceMetrics(course.id, sessions, enrolledStudents.length);
    return {
      name: course.code,
      rate: metrics.percentage,
      "Full Name": course.name
    };
  });

  // 2. Data for Attendance Trend Line Chart
  // Group by date
  const dateMap: Record<string, { date: string; present: number; total: number }> = {};
  filteredSessions.forEach(session => {
    const dateStr = session.date;
    const presents = Object.values(session.attendance).filter(v => v === "present" || v === "late").length;
    const total = Object.keys(session.attendance).length;

    if (!dateMap[dateStr]) {
      dateMap[dateStr] = { date: dateStr, present: 0, total: 0 };
    }
    dateMap[dateStr].present += presents;
    dateMap[dateStr].total += total;
  });

  const trendChartData = Object.keys(dateMap)
    .sort()
    .map(date => {
      const item = dateMap[date];
      return {
        date: date,
        rate: item.total > 0 ? Math.round((item.present / item.total) * 100) : 100
      };
    });

  // 3. Client-side Real CSV Exporter
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = ["Course Code", "Course Name", "Date", "Lecture/Session Topic", "Student Roll No", "Student Name", "Attendance Status"];
    const rows = [headers];

    sessions.forEach(session => {
      const course = courses.find(c => c.id === session.courseId);
      students.forEach(student => {
        const status = session.attendance[student.id];
        if (status) {
          rows.push([
            course?.code || session.courseId,
            course?.name || "",
            session.date,
            session.topic,
            student.rollNumber,
            student.name,
            status.toUpperCase()
          ]);
        }
      });
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `college_attendance_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="analytics-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-600/10">
            <TrendingUp size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">Attendance Analytics</h2>
            <p className="text-xs text-slate-500 mt-0.5">Visualize subject-wise performance and generate exportable logs.</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/10 self-start sm:self-auto"
        >
          <FileSpreadsheet size={16} /> Export CSV Spreadsheet
        </button>
      </div>

      {/* Filter and mini overview card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Scope Filter
            </label>
            <select
              value={activeCourseId}
              onChange={e => setActiveCourseId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Active Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-semibold">Selected Scope Rate</span>
              <span className={`text-2xl font-black ${
                attendanceRate >= 85 ? "text-green-600" : attendanceRate >= 75 ? "text-amber-500" : "text-red-600"
              }`}>
                {attendanceRate}%
              </span>
            </div>

            <div className="space-y-2 mt-4 text-xs font-semibold">
              <div className="flex items-center justify-between text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-100/50">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Present
                </span>
                <span className="font-bold text-slate-900">{totalPresent} marks ({totalRecords > 0 ? Math.round((totalPresent/totalRecords)*100) : 0}%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-100/50">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Late
                </span>
                <span className="font-bold text-slate-900">{totalLate} marks ({totalRecords > 0 ? Math.round((totalLate/totalRecords)*100) : 0}%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 p-2.5 bg-slate-50 rounded-lg border border-slate-100/50">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent
                </span>
                <span className="font-bold text-slate-900">{totalAbsent} marks ({totalRecords > 0 ? Math.round((totalAbsent/totalRecords)*100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic trends line graph */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Attendance Progression Trend</h3>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Percentage over calendar dates</span>
          </div>

          <div className="h-56">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickMargin={5} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Attendance Rate"]} />
                  <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Calendar size={32} className="text-slate-300 mb-1" />
                No sessions registered within this scope to display trends.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course comparative BarChart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Subject Compliance Benchmark</h3>
        <div className="h-64">
          {courseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Compliance Rate"]} />
                <Bar dataKey="rate" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No subjects registered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
