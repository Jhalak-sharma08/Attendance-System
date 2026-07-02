import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Course, Student, Session } from "./types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firestore collection refs
const coursesCol = collection(db, "courses");
const studentsCol = collection(db, "students");
const sessionsCol = collection(db, "sessions");

// Helper to convert collection query snapshot to array
export async function getCourses(): Promise<Course[]> {
  try {
    const snapshot = await getDocs(coursesCol);
    return snapshot.docs.map(doc => doc.data() as Course);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "courses");
  }
}

export async function getStudents(): Promise<Student[]> {
  try {
    const snapshot = await getDocs(studentsCol);
    return snapshot.docs.map(doc => doc.data() as Student);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "students");
  }
}

export async function getSessions(): Promise<Session[]> {
  try {
    const snapshot = await getDocs(sessionsCol);
    return snapshot.docs.map(doc => doc.data() as Session);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "sessions");
  }
}

export async function saveCourse(course: Course): Promise<void> {
  const docRef = doc(db, "courses", course.id);
  try {
    await setDoc(docRef, course);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `courses/${course.id}`);
  }
}

export async function saveStudent(student: Student): Promise<void> {
  const docRef = doc(db, "students", student.id);
  try {
    await setDoc(docRef, student);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.id}`);
  }
}

export async function saveSession(session: Session): Promise<void> {
  const docRef = doc(db, "sessions", session.id);
  try {
    await setDoc(docRef, session);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `sessions/${session.id}`);
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "courses", courseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "students", studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${studentId}`);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "sessions", sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `sessions/${sessionId}`);
  }
}

// Initial seeding data
const initialCourses: Course[] = [
  {
    id: "CS-101",
    name: "Introduction to Computer Science",
    code: "CS 101",
    instructor: "Dr. Alan Turing",
    department: "Computer Science"
  },
  {
    id: "MATH-202",
    name: "Discrete Mathematics",
    code: "MATH 202",
    instructor: "Prof. Ada Lovelace",
    department: "Mathematics"
  },
  {
    id: "CS-301",
    name: "Data Structures & Algorithms",
    code: "CS 301",
    instructor: "Dr. Donald Knuth",
    department: "Computer Science"
  }
];

const initialStudents: Student[] = [
  {
    id: "stud-01",
    name: "Alice Johnson",
    rollNumber: "CS23001",
    email: "alice.johnson@college.edu",
    courseIds: ["CS-101", "CS-301"]
  },
  {
    id: "stud-02",
    name: "Bob Smith",
    rollNumber: "CS23002",
    email: "bob.smith@college.edu",
    courseIds: ["CS-101", "MATH-202"]
  },
  {
    id: "stud-03",
    name: "Charlie Brown",
    rollNumber: "MA23015",
    email: "charlie.brown@college.edu",
    courseIds: ["MATH-202", "CS-301"]
  },
  {
    id: "stud-04",
    name: "Diana Prince",
    rollNumber: "CS23005",
    email: "diana.prince@college.edu",
    courseIds: ["CS-101", "MATH-202", "CS-301"]
  },
  {
    id: "stud-05",
    name: "Ethan Hunt",
    rollNumber: "CS23008",
    email: "ethan.hunt@college.edu",
    courseIds: ["CS-101", "CS-301"]
  },
  {
    id: "stud-06",
    name: "Fiona Gallagher",
    rollNumber: "MA23022",
    email: "fiona.g@college.edu",
    courseIds: ["MATH-202"]
  },
  {
    id: "stud-07",
    name: "George Green",
    rollNumber: "CS23012",
    email: "george.green@college.edu",
    courseIds: ["CS-101", "MATH-202"]
  }
];

const initialSessions: Session[] = [
  {
    id: "sess-01",
    courseId: "CS-101",
    date: "2026-06-25",
    topic: "Intro to Programming & Variables",
    attendance: {
      "stud-01": "present",
      "stud-02": "present",
      "stud-04": "present",
      "stud-05": "late",
      "stud-07": "absent"
    }
  },
  {
    id: "sess-02",
    courseId: "CS-101",
    date: "2026-06-28",
    topic: "Control Flow and Conditionals",
    attendance: {
      "stud-01": "present",
      "stud-02": "present",
      "stud-04": "present",
      "stud-05": "present",
      "stud-07": "present"
    }
  },
  {
    id: "sess-03",
    courseId: "MATH-202",
    date: "2026-06-24",
    topic: "Set Theory & Basic Operations",
    attendance: {
      "stud-02": "present",
      "stud-03": "late",
      "stud-04": "present",
      "stud-06": "absent",
      "stud-07": "present"
    }
  },
  {
    id: "sess-04",
    courseId: "MATH-202",
    date: "2026-06-27",
    topic: "Propositional Logic & Truth Tables",
    attendance: {
      "stud-02": "present",
      "stud-03": "present",
      "stud-04": "absent",
      "stud-06": "present",
      "stud-07": "present"
    }
  },
  {
    id: "sess-05",
    courseId: "CS-301",
    date: "2026-06-26",
    topic: "Big O Notation & Basic Complexity",
    attendance: {
      "stud-01": "present",
      "stud-03": "absent",
      "stud-04": "present",
      "stud-05": "present"
    }
  }
];

// Trigger seeding if database is completely empty
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const existingCourses = await getCourses();
    if (existingCourses.length > 0) {
      return false; // Database already has data, no seeding needed
    }

    console.log("Seeding initial mock college data to Firestore...");

    // Seed Courses
    for (const course of initialCourses) {
      await saveCourse(course);
    }

    // Seed Students
    for (const student of initialStudents) {
      await saveStudent(student);
    }

    // Seed Sessions
    for (const session of initialSessions) {
      await saveSession(session);
    }

    console.log("Seeding complete!");
    return true;
  } catch (error) {
    console.error("Error during initial data seeding:", error);
    return false;
  }
}
