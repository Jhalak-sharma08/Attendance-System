import React, { useState, useEffect } from "react";
import { Course, Student, Session, AttendanceStatus } from "../types";
import { saveSession } from "../dataService";
import { Check, ClipboardList, RefreshCw, Sparkles } from "lucide-react";

interface TakeAttendanceViewProps {
  courses: Course[];
  students: Student[];
  onSaveComplete: () => void;
}

export default function TakeAttendanceView({ courses, students, onSaveComplete }: TakeAttendanceViewProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [topic, setTopic] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter students enrolled in the selected course
  const enrolledStudents = students.filter(student => student.courseIds.includes(selectedCourseId));

  // Initialize/reset attendance states when course changes
  useEffect(() => {
    const initialRecords: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach(student => {
      initialRecords[student.id] = "present"; // Default to present
    });
    setAttendanceRecords(initialRecords);
  }, [selectedCourseId]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated = { ...attendanceRecords };
    enrolledStudents.forEach(student => {
      updated[student.id] = status;
    });
    setAttendanceRecords(updated);
  };

  // Quick helper to auto-generate topic ideas for CS/Math if the professor wants inspiration
  const handleAutoSuggestTopic = () => {
    const topics: Record<string, string[]> = {
      "CS-101": [
        "Binary, Bytes & Data Types",
        "Variables, Expressions and Functions",
        "Conditionals and Boolean Logic",
        "Loops and Iterative Patterns",
        "Recursion and Call Stacks"
      ],
      "MATH-202": [
        "Sets, Venn Diagrams and Power Sets",
        "Propositional Logics & Soundness",
        "Mathematical Induction Foundations",
        "Graph Theory, Vertices and Edges",
        "Combinatorics and Permutations"
      ],
      "CS-301": [
        "Big O Notation and Time Complexities",
        "Singly and Doubly Linked Lists",
        "Stack and Queue Linear Structs",
        "Binary Search Tree Alignments",
        "Heaps, Sorting and Priorities"
      ]
    };

    const suggestions = topics[selectedCourseId] || [
      "Midterm Review & Problem Solving",
      "Lab Session & Project Milestone",
      "Guest Lecture: Industry Practices"
    ];

    const randomTopic = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTopic(randomTopic);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setMessage({ type: "error", text: "Please select a course first." });
      return;
    }
    if (!topic.trim()) {
      setMessage({ type: "error", text: "Please enter a session topic." });
      return;
    }
    if (enrolledStudents.length === 0) {
      setMessage({ type: "error", text: "There are no students enrolled in this course to take attendance for." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const newSession: Session = {
      id: `sess-${Date.now()}`,
      courseId: selectedCourseId,
      date,
      topic: topic.trim(),
      attendance: attendanceRecords
    };

    try {
      await saveSession(newSession);
      setMessage({ type: "success", text: "Attendance sheet recorded and synchronized successfully!" });
      setTopic("");
      // Refresh list in parent after short delay
      setTimeout(() => {
        onSaveComplete();
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to sync attendance. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn" id="take-attendance-view">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-600/10">
          <ClipboardList size={18} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Record Attendance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Log real-time class attendance session registers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form controls */}
        <div className="md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Session Settings</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Select Course
              </label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                required
              >
                <option value="">-- Choose Subject --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Session Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Lecture Topic
                </label>
                {selectedCourseId && (
                  <button
                    type="button"
                    onClick={handleAutoSuggestTopic}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                  >
                    <Sparkles size={10} /> Suggest
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Big O Complexity Analysis"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-xs font-medium border ${
                message.type === "success" ? "bg-green-50 text-green-800 border-green-100" : "bg-red-50 text-red-800 border-red-100"
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !selectedCourseId || enrolledStudents.length === 0}
              className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all text-white cursor-pointer ${
                saving || !selectedCourseId || enrolledStudents.length === 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/10 border border-blue-600"
              }`}
            >
              {saving ? "Synchronizing..." : "Submit Roll Call"}
            </button>
          </form>
        </div>

        {/* Right Student attendance list */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrolled Students</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCourseId ? `${enrolledStudents.length} student(s) registered` : "Please select a course to load students"}
              </p>
            </div>

            {selectedCourseId && enrolledStudents.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll("present")}
                  className="px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-100 transition-colors cursor-pointer"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll("absent")}
                  className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors cursor-pointer"
                >
                  All Absent
                </button>
              </div>
            )}
          </div>

          {!selectedCourseId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <ClipboardList size={36} strokeWidth={1.5} className="text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-800">No Course Selected</p>
              <p className="text-xs mt-1 text-slate-500">Choose a course from the Left panel to display its student roster.</p>
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <RefreshCw size={36} strokeWidth={1.5} className="text-slate-300 animate-spin mb-2" />
              <p className="text-sm font-semibold text-slate-800">Roster is Empty</p>
              <p className="text-xs mt-1 text-slate-500">No students are currently registered to this course ID.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px] pr-1">
              {enrolledStudents.map((stud) => {
                const currentStatus = attendanceRecords[stud.id] || "present";
                return (
                  <div
                    key={stud.id}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{stud.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {stud.rollNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{stud.email}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-center border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(stud.id, "present")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          currentStatus === "present"
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(stud.id, "late")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          currentStatus === "late"
                            ? "bg-amber-500 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        Late
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(stud.id, "absent")}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          currentStatus === "absent"
                            ? "bg-red-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
