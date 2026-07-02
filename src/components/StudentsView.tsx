import React, { useState } from "react";
import { Course, Student, Session } from "../types";
import { saveStudent, deleteStudent } from "../dataService";
import { Users, Plus, Trash2, Search, Mail, BookOpen, AlertCircle, Eye, X, CheckCircle } from "lucide-react";
import { getStudentAttendanceMetrics } from "../utils";

interface StudentsViewProps {
  courses: Course[];
  students: Student[];
  sessions: Session[];
  onRefresh: () => void;
  selectedStudentIdFromDashboard?: string;
}

export default function StudentsView({
  courses,
  students,
  sessions,
  onRefresh,
  selectedStudentIdFromDashboard
}: StudentsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("");

  // Detailed view of a single student
  const [activeStudentDetail, setActiveStudentDetail] = useState<Student | null>(() => {
    if (selectedStudentIdFromDashboard) {
      return students.find(s => s.id === selectedStudentIdFromDashboard) || null;
    }
    return null;
  });

  const handleToggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim() || !email.trim()) {
      setError("Please fill out Name, Roll Number, and Email.");
      return;
    }
    if (selectedCourseIds.length === 0) {
      setError("Please select at least one course for enrollment.");
      return;
    }

    setSaving(true);
    setError("");

    const newStudent: Student = {
      id: `stud-${Date.now()}`,
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      courseIds: selectedCourseIds
    };

    try {
      await saveStudent(newStudent);
      setName("");
      setRollNumber("");
      setEmail("");
      setSelectedCourseIds([]);
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      setError("Failed to register student. Please check inputs.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (confirm("Are you sure you want to delete this student profile?")) {
      try {
        await deleteStudent(studentId);
        if (activeStudentDetail?.id === studentId) {
          setActiveStudentDetail(null);
        }
        onRefresh();
      } catch (err) {
        console.error(err);
        alert("Failed to delete student.");
      }
    }
  };

  // Filter students based on search and selected course
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourseFilter ? student.courseIds.includes(selectedCourseFilter) : true;

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="students-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-600/10">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">Students Database</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enroll students, search rosters, and view custom logs.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-sm shadow-blue-600/10"
        >
          <Plus size={16} /> Enroll Student
        </button>
      </div>

      {/* Add Student Form Panel */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-2xl mx-auto space-y-4 shadow-md animate-fadeIn">
          <h3 className="text-base font-bold text-slate-900">Enroll New Student</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Roll / Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS23010"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Course Multiselect checkboxes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Register Courses
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {courses.map(course => {
                  const isChecked = selectedCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleToggleCourseSelection(course.id)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? "bg-blue-50 border-blue-200 text-blue-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">
                        <strong className="font-mono">{course.code}:</strong> {course.name}
                      </span>
                      {isChecked && <CheckCircle size={14} className="text-blue-600 shrink-0 ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-100">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/10"
              >
                {saving ? "Registering..." : "Register Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster Controls: Search & Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Roll No, or Email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="min-w-[180px]">
          <select
            value={selectedCourseFilter}
            onChange={e => setSelectedCourseFilter(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="">-- Filter by Course --</option>
            {courses.map(course => (
               <option key={course.id} value={course.id}>
                 {course.code}
               </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Panel grid: Student List / Detail view splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Student list */}
        <div className={`lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-2">ID / Roll No</th>
                  <th className="py-3.5 px-2">Courses Enrolled</th>
                  <th className="py-3.5 px-2 text-center">Attendance %</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const metrics = getStudentAttendanceMetrics(student, sessions);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        activeStudentDetail?.id === student.id ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                          <Mail size={10} /> {student.email}
                        </p>
                      </td>
                      <td className="py-3.5 px-2 font-mono font-bold text-slate-600">{student.rollNumber}</td>
                      <td className="py-3.5 px-2 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {student.courseIds.map(cId => (
                            <span
                              key={cId}
                              className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200/50 truncate max-w-[80px]"
                              title={courses.find(c => c.id === cId)?.name || cId}
                            >
                              {cId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span
                          className={`font-bold text-sm ${
                            metrics.percentage >= 85
                              ? "text-green-600"
                              : metrics.percentage >= 75
                              ? "text-amber-500"
                              : "text-red-600"
                          }`}
                        >
                          {metrics.percentage}%
                        </span>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {metrics.presentCount}/{metrics.totalEligible} days
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveStudentDetail(student)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Student Attendance Log"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Unenroll Student"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No matching student profiles found. Try a different query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student detail view side-panel */}
        <div className="lg:col-span-1">
          {activeStudentDetail ? (
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 animate-slideIn">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{activeStudentDetail.name}</h3>
                  <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded inline-block border border-slate-200/50">
                    Roll No: {activeStudentDetail.rollNumber}
                  </p>
                </div>
                <button
                  onClick={() => setActiveStudentDetail(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Attendance metrics */}
              {(() => {
                const metrics = getStudentAttendanceMetrics(activeStudentDetail, sessions);

                return (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumulative Attendance</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{metrics.percentage}%</p>
                      </div>
                      <div className="text-right">
                        {metrics.percentage >= 75 ? (
                          <span className="px-2 py-1 text-[10px] bg-green-50 text-green-800 border border-green-100 rounded-full font-bold">
                            Compliant
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-[10px] bg-red-50 text-red-800 border border-red-100 rounded-full font-bold flex items-center gap-1">
                            <AlertCircle size={10} /> At Risk
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Class-wise logs */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Subject Breakdown</h4>
                      <div className="space-y-2">
                        {metrics.courseBreakdown.map(b => {
                          const course = courses.find(c => c.id === b.courseId);
                          return (
                            <div key={b.courseId} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="font-semibold text-slate-800 truncate text-[11px]">
                                  {course?.name || b.courseId}
                                </p>
                                <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{course?.code || b.courseId}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`font-bold ${
                                  b.percentage >= 85 ? "text-green-600" : b.percentage >= 75 ? "text-amber-500" : "text-red-600"
                                }`}>
                                  {b.percentage}%
                                </span>
                                <p className="text-[8px] text-slate-400 mt-0.5 font-mono">({b.attended}/{b.total} lectures)</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Log details */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Recent Sessions History</h4>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {sessions
                          .filter(s => activeStudentDetail.courseIds.includes(s.courseId))
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map(session => {
                            const status = session.attendance[activeStudentDetail.id];
                            if (!status) return null;

                            return (
                              <div key={session.id} className="p-2 bg-white border border-slate-200 rounded flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-slate-800 truncate text-[10px] max-w-[140px]">{session.topic}</p>
                                  <p className="text-[8px] text-slate-400 mt-0.5 font-mono">{session.date} • {session.courseId}</p>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
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
                );
              })()}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
              <Eye size={28} className="mx-auto text-slate-300 mb-2" strokeWidth={1.5} />
              <p className="font-semibold text-slate-600">No Student Inspected</p>
              <p className="text-slate-400 mt-1">Click the view eyeball button next to any student row to load full attendance card.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
