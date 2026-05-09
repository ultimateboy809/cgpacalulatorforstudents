// CGPA / GPA utilities supporting multiple Indian university grading systems

export type UniversityId = "aicte" | "jntuh" | "anna" | "vtu" | "mumbai";

export interface GradeScale {
  grade: string;
  points: number;
}

export interface University {
  id: UniversityId;
  name: string;
  shortName: string;
  scaleMax: number;
  scale: GradeScale[];
  /** Convert CGPA -> percentage */
  toPercentage: (cgpa: number) => number;
  percentageFormula: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: "aicte",
    name: "AICTE / Standard 10-Point",
    shortName: "AICTE",
    scaleMax: 10,
    scale: [
      { grade: "O", points: 10 },
      { grade: "A+", points: 9 },
      { grade: "A", points: 8 },
      { grade: "B+", points: 7 },
      { grade: "B", points: 6 },
      { grade: "C", points: 5 },
      { grade: "P", points: 4 },
      { grade: "F", points: 0 },
    ],
    toPercentage: (c) => Math.max(0, (c - 0.75) * 10),
    percentageFormula: "(CGPA − 0.75) × 10",
  },
  {
    id: "jntuh",
    name: "JNTU Hyderabad (R18 / R22)",
    shortName: "JNTUH",
    scaleMax: 10,
    scale: [
      { grade: "O", points: 10 },
      { grade: "A+", points: 9 },
      { grade: "A", points: 8 },
      { grade: "B+", points: 7 },
      { grade: "B", points: 6 },
      { grade: "C", points: 5 },
      { grade: "D", points: 4 },
      { grade: "F", points: 0 },
    ],
    toPercentage: (c) => Math.max(0, (c - 0.75) * 10),
    percentageFormula: "(CGPA − 0.75) × 10",
  },
  {
    id: "anna",
    name: "Anna University",
    shortName: "Anna Univ",
    scaleMax: 10,
    scale: [
      { grade: "O", points: 10 },
      { grade: "A+", points: 9 },
      { grade: "A", points: 8 },
      { grade: "B+", points: 7 },
      { grade: "B", points: 6 },
      { grade: "C", points: 5 },
      { grade: "RA", points: 0 },
      { grade: "U", points: 0 },
    ],
    toPercentage: (c) => Math.max(0, c * 10),
    percentageFormula: "CGPA × 10",
  },
  {
    id: "vtu",
    name: "VTU (Visvesvaraya Tech Univ)",
    shortName: "VTU",
    scaleMax: 10,
    scale: [
      { grade: "S", points: 10 },
      { grade: "A", points: 9 },
      { grade: "B", points: 8 },
      { grade: "C", points: 7 },
      { grade: "D", points: 6 },
      { grade: "E", points: 5 },
      { grade: "F", points: 0 },
    ],
    toPercentage: (c) => Math.max(0, (c - 0.75) * 10),
    percentageFormula: "(CGPA − 0.75) × 10",
  },
  {
    id: "mumbai",
    name: "Mumbai University",
    shortName: "MU",
    scaleMax: 10,
    scale: [
      { grade: "O", points: 10 },
      { grade: "A", points: 9 },
      { grade: "B", points: 8 },
      { grade: "C", points: 7 },
      { grade: "D", points: 6 },
      { grade: "E", points: 5 },
      { grade: "F", points: 0 },
    ],
    toPercentage: (c) => Math.max(0, 7.1 * c + 11),
    percentageFormula: "7.1 × CGPA + 11",
  },
];

export const getUniversity = (id: UniversityId): University =>
  UNIVERSITIES.find((u) => u.id === id) ?? UNIVERSITIES[0];

export const getGradePoints = (uni: University, grade: string): number =>
  uni.scale.find((g) => g.grade === grade)?.points ?? 0;

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export const calcSGPA = (courses: Course[], uni: University): number => {
  const valid = courses.filter((c) => c.credits > 0);
  if (!valid.length) return 0;
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  const totalPoints = valid.reduce((s, c) => s + c.credits * getGradePoints(uni, c.grade), 0);
  return totalCredits ? totalPoints / totalCredits : 0;
};

export const calcCGPA = (semesters: Semester[], uni: University): number => {
  const all = semesters.flatMap((s) => s.courses).filter((c) => c.credits > 0);
  if (!all.length) return 0;
  const totalCredits = all.reduce((s, c) => s + c.credits, 0);
  const totalPoints = all.reduce((s, c) => s + c.credits * getGradePoints(uni, c.grade), 0);
  return totalCredits ? totalPoints / totalCredits : 0;
};

export const classification = (cgpa: number): { label: string; tone: string } => {
  if (cgpa >= 9) return { label: "Outstanding", tone: "from-violet-500 to-fuchsia-500" };
  if (cgpa >= 8)
    return { label: "First Class with Distinction", tone: "from-cyan-500 to-blue-500" };
  if (cgpa >= 6.5) return { label: "First Class", tone: "from-emerald-500 to-teal-500" };
  if (cgpa >= 5.5) return { label: "Second Class", tone: "from-amber-500 to-orange-500" };
  if (cgpa >= 5) return { label: "Pass Class", tone: "from-orange-500 to-red-500" };
  return { label: "Below Pass", tone: "from-red-500 to-rose-600" };
};

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Map a course's grade to the closest equivalent in a new university scale by points. */
export const remapGrade = (oldUni: University, newUni: University, grade: string): string => {
  const oldPoints = getGradePoints(oldUni, grade);
  // Find closest point value in new scale
  let best = newUni.scale[0];
  let bestDiff = Math.abs(best.points - oldPoints);
  for (const g of newUni.scale) {
    const d = Math.abs(g.points - oldPoints);
    if (d < bestDiff) {
      bestDiff = d;
      best = g;
    }
  }
  return best.grade;
};
