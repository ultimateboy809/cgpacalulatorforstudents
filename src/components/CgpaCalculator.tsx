import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Sun, Moon, Sparkles, GraduationCap, RotateCcw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  type Course,
  type Grade,
  type Semester,
  GRADES,
  GRADE_POINTS,
  calcCGPA,
  calcSGPA,
  cgpaToPercentage,
  classification,
  uid,
} from "@/lib/cgpa";
import { useTheme } from "@/hooks/use-theme";

const STORAGE_KEY = "cgpa-calc-v1";

const newCourse = (): Course => ({ id: uid(), name: "", credits: 3, grade: "A" });
const newSemester = (n: number): Semester => ({
  id: uid(),
  name: `Semester ${n}`,
  courses: [newCourse(), newCourse(), newCourse()],
});

export function CgpaCalculator() {
  const { theme, toggle } = useTheme();
  const [semesters, setSemesters] = useState<Semester[]>([newSemester(1)]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Semester[];
        if (Array.isArray(parsed) && parsed.length) setSemesters(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters, hydrated]);

  const cgpa = useMemo(() => calcCGPA(semesters), [semesters]);
  const percentage = useMemo(() => cgpaToPercentage(cgpa), [cgpa]);
  const totalCredits = useMemo(
    () => semesters.flatMap((s) => s.courses).reduce((sum, c) => sum + (c.credits || 0), 0),
    [semesters],
  );
  const totalCourses = useMemo(
    () => semesters.flatMap((s) => s.courses).length,
    [semesters],
  );
  const status = classification(cgpa);

  const updateCourse = (semId: string, courseId: string, patch: Partial<Course>) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)) }
          : s,
      ),
    );
  };

  const addCourse = (semId: string) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === semId ? { ...s, courses: [...s.courses, newCourse()] } : s)),
    );
  };

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) } : s,
      ),
    );
  };

  const addSemester = () => {
    setSemesters((prev) => [...prev, newSemester(prev.length + 1)]);
    toast.success("Semester added");
  };

  const removeSemester = (semId: string) => {
    setSemesters((prev) => (prev.length === 1 ? prev : prev.filter((s) => s.id !== semId)));
  };

  const reset = () => {
    setSemesters([newSemester(1)]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Reset complete");
  };

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-6 sm:py-10 lg:px-12">
      {/* Floating decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-20 h-72 w-72 rounded-full opacity-30 blur-3xl animate-float"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div
          className="absolute top-1/2 -right-20 h-80 w-80 rounded-full opacity-25 blur-3xl animate-float"
          style={{ background: "var(--gradient-accent)", animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-lg glow-primary"
              style={{ background: "var(--gradient-primary)" }}
            >
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="gradient-text">CGPA</span> Calculator
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Built for Indian engineering students · 10-point scale
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
              className="glass border-0 hover:scale-110 transition-transform"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              aria-label="Reset"
              className="glass border-0 hover:scale-110 transition-transform"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Result hero */}
        <section
          className="glass relative mb-6 overflow-hidden rounded-3xl p-6 sm:p-10 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: "var(--gradient-mesh)" }}
          />
          <div className="relative grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Cumulative GPA
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-6xl font-bold tabular-nums gradient-text sm:text-7xl">
                  {cgpa.toFixed(2)}
                </span>
                <span className="text-xl text-muted-foreground">/10</span>
              </div>
              <div
                className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${status.tone} px-3 py-1 text-xs font-semibold text-white shadow-lg`}
              >
                <Sparkles className="h-3 w-3" />
                {status.label}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <Stat label="Percentage" value={`${percentage.toFixed(2)}%`} />
              <Stat label="Credits" value={String(totalCredits)} />
              <Stat label="Courses" value={String(totalCourses)} />
            </div>
          </div>
        </section>

        {/* Semesters */}
        <div className="space-y-5">
          {semesters.map((sem, idx) => {
            const sgpa = calcSGPA(sem.courses);
            const semCredits = sem.courses.reduce((s, c) => s + (c.credits || 0), 0);
            return (
              <section
                key={sem.id}
                className="glass rounded-2xl p-4 sm:p-6 animate-fade-up"
                style={{ animationDelay: `${0.15 + idx * 0.05}s` }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
                      style={{ background: "var(--gradient-accent)" }}
                    >
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <Input
                      value={sem.name}
                      onChange={(e) =>
                        setSemesters((prev) =>
                          prev.map((s) => (s.id === sem.id ? { ...s, name: e.target.value } : s)),
                        )
                      }
                      className="h-9 w-40 border-0 bg-transparent px-2 text-base font-semibold focus-visible:ring-1 sm:w-56"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        SGPA · {semCredits} cr
                      </p>
                      <p className="text-xl font-bold tabular-nums gradient-text">
                        {sgpa.toFixed(2)}
                      </p>
                    </div>
                    {semesters.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSemester(sem.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Remove semester"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Course list */}
                <div className="space-y-2">
                  {/* Header row (desktop) */}
                  <div className="hidden grid-cols-12 gap-2 px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:grid">
                    <div className="col-span-6">Course</div>
                    <div className="col-span-2">Credits</div>
                    <div className="col-span-3">Grade</div>
                    <div className="col-span-1"></div>
                  </div>

                  {sem.courses.map((course) => (
                    <div
                      key={course.id}
                      className="grid grid-cols-12 items-center gap-2 rounded-xl bg-secondary/40 p-2 transition-colors hover:bg-secondary/70"
                    >
                      <Input
                        placeholder="Subject name"
                        value={course.name}
                        onChange={(e) =>
                          updateCourse(sem.id, course.id, { name: e.target.value })
                        }
                        className="col-span-12 h-10 border-0 bg-transparent focus-visible:ring-1 sm:col-span-6"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={course.credits}
                        onChange={(e) =>
                          updateCourse(sem.id, course.id, {
                            credits: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="col-span-5 h-10 border-0 bg-background/50 text-center font-mono tabular-nums focus-visible:ring-1 sm:col-span-2"
                      />
                      <div className="col-span-6 sm:col-span-3">
                        <Select
                          value={course.grade}
                          onValueChange={(v) =>
                            updateCourse(sem.id, course.id, { grade: v as Grade })
                          }
                        >
                          <SelectTrigger className="h-10 w-full border-0 bg-background/50 font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADES.map((g) => (
                              <SelectItem key={g} value={g}>
                                <span className="flex items-center justify-between gap-3">
                                  <span className="font-bold">{g}</span>
                                  <span className="font-mono text-xs text-muted-foreground">
                                    {GRADE_POINTS[g]} pts
                                  </span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCourse(sem.id, course.id)}
                        className="col-span-1 h-9 w-9 justify-self-end text-muted-foreground hover:text-destructive"
                        aria-label="Remove course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => addCourse(sem.id)}
                  className="mt-3 w-full justify-center gap-2 border border-dashed border-border/60 hover:border-primary/60 hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4" /> Add course
                </Button>
              </section>
            );
          })}
        </div>

        <Button
          onClick={addSemester}
          className="mt-6 h-12 w-full gap-2 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] glow-primary"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-5 w-5" /> Add Semester
        </Button>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Saved locally on your device · Percentage = (CGPA − 0.75) × 10
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/40 p-3 backdrop-blur-sm sm:p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}
