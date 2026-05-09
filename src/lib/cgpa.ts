// CGPA / GPA utilities (Indian engineering 10-point system, AICTE standard)

export type Grade = "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F";

export const GRADE_POINTS: Record<Grade, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

export const GRADES: Grade[] = ["O", "A+", "A", "B+", "B", "C", "P", "F"];

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: Grade;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export const calcSGPA = (courses: Course[]): number => {
  const valid = courses.filter((c) => c.credits > 0);
  if (!valid.length) return 0;
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  const totalPoints = valid.reduce((s, c) => s + c.credits * GRADE_POINTS[c.grade], 0);
  return totalCredits ? totalPoints / totalCredits : 0;
};

export const calcCGPA = (semesters: Semester[]): number => {
  const all = semesters.flatMap((s) => s.courses).filter((c) => c.credits > 0);
  if (!all.length) return 0;
  const totalCredits = all.reduce((s, c) => s + c.credits, 0);
  const totalPoints = all.reduce((s, c) => s + c.credits * GRADE_POINTS[c.grade], 0);
  return totalCredits ? totalPoints / totalCredits : 0;
};

// AICTE / common Indian universities: Percentage = (CGPA - 0.75) * 10
export const cgpaToPercentage = (cgpa: number): number =>
  cgpa > 0 ? Math.max(0, (cgpa - 0.75) * 10) : 0;

export const classification = (cgpa: number): { label: string; tone: string } => {
  if (cgpa >= 9) return { label: "Outstanding", tone: "from-violet-500 to-fuchsia-500" };
  if (cgpa >= 8) return { label: "First Class with Distinction", tone: "from-cyan-500 to-blue-500" };
  if (cgpa >= 6.5) return { label: "First Class", tone: "from-emerald-500 to-teal-500" };
  if (cgpa >= 5.5) return { label: "Second Class", tone: "from-amber-500 to-orange-500" };
  if (cgpa >= 5) return { label: "Pass Class", tone: "from-orange-500 to-red-500" };
  return { label: "Below Pass", tone: "from-red-500 to-rose-600" };
};

export const uid = () => Math.random().toString(36).slice(2, 10);
