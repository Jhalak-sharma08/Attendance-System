import React, { useState } from "react";
import { Course, Student, Session } from "../types";
import { saveCourse, deleteCourse } from "../dataService";
import { BookOpen, Plus, Trash2, Users, GraduationCap, Percent } from "lucide-react";
import { getCourseAttendanceMetrics } from "../utils";

interface CoursesViewProps {
  courses: Course[];
  students: Student[];
  sessions: Session[];
  onRefresh: () => void;
}

export default function CoursesView({ courses, students, sessions, onRefresh }: CoursesViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [instructor, setInstructor] = useState("");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !instructor.trim() || !department.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setSaving(true);
    setError("");

    const newId = code.replace(/\s+/g, "-").toUpperCase();
    const newCourse: Course = {
      id: newId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      department: department.trim()
    };

    try {
      await saveCourse(newCourse);
      setName("");
      setCode("");
      setInstructor("");
      setDepartment("");
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      setError("Failed to create course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course? This will not delete past sessions but will unregister any students.")) {
      try {
        await deleteCourse(courseId);
        onRefresh();
      } catch (err) {
        console.error(err);
        alert("Failed to delete course.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="courses-view">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-600/10">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">Course Catalogs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage classes, assign lecturers, and review enrollment.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/10"
        >
          <Plus size={16} /> New Course
        </button>
      </div>

      {/* Add Course Form Panel */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl max-w-2xl mx-auto space-y-4 shadow-md animate-fadeIn">
          <h3 className="text-base font-bold text-slate-900">Create New Course</h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS 101"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Course Title
              </label>
              <input
                type="text"
                placeholder="e.g. Introduction to Computer Science"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Instructor / Professor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Alan Turing"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {error && (
              <div className="sm:col-span-2 text-xs text-red-700 bg-red-50 p-2.5 rounded border border-red-100">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
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
                {saving ? "Creating..." : "Save Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map(course => {
          const courseStudents = students.filter(s => s.courseIds.includes(course.id));
          const metrics = getCourseAttendanceMetrics(course.id, sessions, courseStudents.length);

          return (
            <div
              key={course.id}
              className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    {course.code}
                  </span>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-slate-900 tracking-tight text-base leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                    <GraduationCap size={14} className="text-slate-400" /> {course.instructor}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{course.department}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div className="flex justify-center text-blue-600 mb-1">
                    <Users size={14} />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">Enrolled</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{courseStudents.length}</p>
                </div>

                <div className="text-center p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div className="flex justify-center text-green-600 mb-1">
                    <BookOpen size={14} />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">Sessions</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{metrics.totalSessions}</p>
                </div>

                <div className="text-center p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                  <div className="flex justify-center text-amber-500 mb-1">
                    <Percent size={14} />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">Average</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{metrics.percentage}%</p>
                </div>
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <BookOpen size={40} strokeWidth={1} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No Course Catalog Found</p>
            <p className="text-xs text-slate-400 mt-1">Click the "New Course" button to establish subjects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
