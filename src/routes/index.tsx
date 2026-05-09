import { createFileRoute } from "@tanstack/react-router";
import { CgpaCalculator } from "@/components/CgpaCalculator";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CGPA Calculator – Indian Engineering Students | GPA & Percentage" },
      {
        name: "description",
        content:
          "Modern CGPA & SGPA calculator for Indian engineering students. Add semesters, credits & grades. Auto percentage conversion, dark mode, saved locally.",
      },
    ],
  }),
});

function Index() {
  return (
    <>
      <CgpaCalculator />
      <Toaster position="top-center" />
    </>
  );
}
