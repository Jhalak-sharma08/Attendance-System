import React, { useState, useEffect } from "react";
import { getCourses, getStudents, getSessions, seedInitialDataIfEmpty } from "./dataService";
import { Course, Student, Session } from "./types";
import DashboardView from "./components/DashboardView";
import TakeAttendanceView from "./components/TakeAttendanceView";
import CoursesView from "./components/CoursesView";
import StudentsView from "./components/StudentsView";
import AnalyticsView from "./components/AnalyticsView";
import StudentPortalView from "./components/StudentPortalView";
import { GraduationCap, BookOpen, Layers, Users, TrendingUp, HelpCircle, Loader2, RefreshCw, ClipboardList } from "lucide-react";

type UserRole = "professor" | "student";

export default function App() {
  const [role, setRole] = useState<UserRole>("professor");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Detail viewing targets sent across views
  const [studentDetailId, setStudentDetailId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      const dbCourses = await getCourses();
      const dbStudents = await getStudents();
      const dbSessions = await getSessions();

      setCourses(dbCourses);
      setStudents(dbStudents);
      setSessions(dbSessions);
    } catch (error) {
      console.error("Error fetching Firestore records:", error);
    }
  };

  // Perform seeding check and fetch database on initial mount
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        const seeded = await seedInitialDataIfEmpty();
        if (seeded) {
          setIsSeeding(true);
          // Small delay to let Firebase commit index writes
          await new Promise(r => setTimeout(r, 1000));
        }
        await loadData();
      } catch (err) {
        console.error("Initialization failure:", err);
      } finally {
        setLoading(false);
        setIsSeeding(false);
      }
    };
    initApp();
  }, []);

  const handleNavigation = (view: string, courseId?: string, studentId?: string) => {
    setActiveTab(view);
    if (studentId) {
      setStudentDetailId(studentId);
    } else {
      setStudentDetailId(undefined);
    }
  };

  // Handle switching role
  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    setActiveTab(newRole === "professor" ? "dashboard" : "student-portal");
    setStudentDetailId(undefined);
  };

  // Render proper layout based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            courses={courses}
            students={students}
            sessions={sessions}
            onNavigate={handleNavigation}
          />
        );
      case "take-attendance":
        return (
          <TakeAttendanceView
            courses={courses}
            students={students}
            onSaveComplete={async () => {
              await loadData();
              setActiveTab("dashboard");
            }}
          />
        );
      case "courses":
        return (
          <CoursesView
            courses={courses}
            students={students}
            sessions={sessions}
            onRefresh={loadData}
          />
        );
      case "students":
        return (
          <StudentsView
            courses={courses}
            students={students}
            sessions={sessions}
            onRefresh={loadData}
            selectedStudentIdFromDashboard={studentDetailId}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            courses={courses}
            students={students}
            sessions={sessions}
          />
        );
      case "student-portal":
        return (
          <StudentPortalView
            courses={courses}
            students={students}
            sessions={sessions}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 max-w-sm">
          <Loader2 size={36} className="text-slate-900 animate-spin" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isSeeding ? "Syncing Sample Database..." : "Connecting Classroom Server..."}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Establishing client channel and validating Firestore tables. Please stand by.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="app-root">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-600/20">
              <GraduationCap size={16} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">EduLog</span>
          </div>

          <nav className="space-y-1">
            {role === "professor" ? (
              <>
                <button
                  onClick={() => handleNavigation("dashboard")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Layers size={17} /> Dashboard
                </button>
                <button
                  onClick={() => handleNavigation("take-attendance")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "take-attendance"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <ClipboardList size={17} /> Conduct Roll Call
                </button>
                <button
                  onClick={() => handleNavigation("courses")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "courses"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <BookOpen size={17} /> My Classes
                </button>
                <button
                  onClick={() => handleNavigation("students")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "students"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Users size={17} /> Student Directory
                </button>
                <button
                  onClick={() => handleNavigation("analytics")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
                    activeTab === "analytics"
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <TrendingUp size={17} /> Reports
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation("student-portal")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
                  activeTab === "student-portal"
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <GraduationCap size={17} /> Student Portal
              </button>
            )}
          </nav>

          {/* Access mode toggler */}
          <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Mode</p>
            <div className="flex flex-col gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                onClick={() => handleRoleSwitch("professor")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "professor"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Layers size={13} /> Professor View
              </button>
              <button
                onClick={() => handleRoleSwitch("student")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === "student"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <GraduationCap size={13} /> Student Portal
              </button>
            </div>
          </div>
        </div>

        {/* Profile metadata panel */}
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold border border-slate-200">
              {role === "professor" ? "SC" : "ST"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {role === "professor" ? "Dr. Sarah Chen" : "Enrolled Student"}
              </p>
              <p className="text-xs text-slate-500">
                {role === "professor" ? "Senior Faculty" : "Academic Portal"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={16} />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">EduLog</span>
            </div>

            {/* Compact mode switcher for mobile */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => handleRoleSwitch("professor")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                  role === "professor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Faculty
              </button>
              <button
                onClick={() => handleRoleSwitch("student")}
                className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                  role === "student" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                Student
              </button>
            </div>
          </div>

          {/* Scrolling horizontal tabs for mobile */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-50 pt-2">
            {role === "professor" ? (
              <>
                <button
                  onClick={() => handleNavigation("dashboard")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation("take-attendance")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    activeTab === "take-attendance"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <ClipboardList size={11} /> Roll Call
                </button>
                <button
                  onClick={() => handleNavigation("courses")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    activeTab === "courses"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <BookOpen size={11} /> Classes
                </button>
                <button
                  onClick={() => handleNavigation("students")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    activeTab === "students"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Users size={11} /> Students
                </button>
                <button
                  onClick={() => handleNavigation("analytics")}
                  className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    activeTab === "analytics"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <TrendingUp size={11} /> Reports
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigation("student-portal")}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  activeTab === "student-portal"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <GraduationCap size={11} /> Portal
              </button>
            )}
          </div>
        </header>

        {/* Global Breadcrumb-like topbar for Desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 text-sm shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => handleNavigation("dashboard")}>EduLog</span>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold text-slate-900 capitalize">
              {role === "professor" ? activeTab.replace("-", " ") : "Student Portal"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-xs">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </header>

        {/* Main Layout Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fadeIn bg-slate-50/50">
          {renderTabContent()}
        </main>

        {/* Humble, clean Footer */}
        <footer className="bg-white border-t border-slate-200 py-5 text-center text-[10px] text-slate-400 font-mono mt-auto shrink-0">
          <div className="px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-7xl mx-auto">
            <p>© 2026 EduLog Registrar System. Connected to Secure Cloud Firestore.</p>
            <div className="flex justify-center gap-3">
              <span className="hover:text-slate-600 cursor-pointer">Security Protocol v2</span>
              <span>•</span>
              <span className="hover:text-slate-600 cursor-pointer">Durable Cloud Ledger</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
