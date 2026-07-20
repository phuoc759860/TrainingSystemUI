import { Link } from "react-router-dom";
import PageIllustration from "./PageIllustration";

const activity = [
  {
    kind: "graded",
    title: "Sarah Chen",
    detail: "Quiz 3 · React Basics",
    badge: "92%",
    badgeTone: "success"
  },
  {
    kind: "progress",
    title: "Marcus Diallo",
    detail: "Module 4 · Video Lesson",
    progress: 68
  },
  {
    kind: "enrolled",
    title: "Aisha Patel",
    detail: "UX Fundamentals",
    badge: "Enrolled",
    badgeTone: "brand"
  }
];

function GradebookCard() {
  return (
    <div className="relative mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl shadow-gray-900/10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">Advanced Excel</p>
          <p className="text-sm font-semibold text-gray-900">Module 4 — Live Activity</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="space-y-3">
        {activity.map((row, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-gray-900">{row.title}</p>
                <p className="text-[12px] text-gray-500">{row.detail}</p>
              </div>
              {row.badge && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    row.badgeTone === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {row.badge}
                </span>
              )}
            </div>
            {row.progress != null && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-violet-500 to-violet-400"
                  style={{ width: `${row.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-gray-400">
        Multiple-choice exams auto-graded on submit
      </p>
    </div>
  );
}

export default function HeroHome() {
  return (
    <section className="relative">
      <PageIllustration />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 pt-32 pb-20 md:pb-28 md:pt-40 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <p
              className="mb-4 text-sm font-semibold tracking-wide text-violet-600 uppercase"
              data-aos="fade-up"
            >
              Courses · Exams · Grading
            </p>
            <h1
              className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              Where courses, exams, and grades finally agree.
            </h1>
            <p
              className="mx-auto mb-8 max-w-lg text-lg text-gray-600 lg:mx-0"
              data-aos="fade-up"
              data-aos-delay={200}
            >
              TrainingHub gives trainers one place to build courses, grade
              multiple-choice exams instantly, and see exactly who needs
              help — with role-based access for admins, trainers, and
              students from day one.
            </p>
            <div
              className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
              data-aos="fade-up"
              data-aos-delay={300}
            >
              <Link
                to="/register"
                className="landing-btn group w-full bg-linear-to-t from-violet-600 to-violet-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-sm hover:bg-[length:100%_150%] sm:w-auto"
              >
                <span className="relative inline-flex items-center">
                  Get Started{" "}
                  <span className="ml-1 tracking-normal text-violet-300 transition-transform group-hover:translate-x-0.5">
                    -&gt;
                  </span>
                </span>
              </Link>
              <Link
                to="#features"
                className="landing-btn w-full bg-white text-gray-800 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 sm:w-auto"
              >
                See what's included
              </Link>
            </div>
          </div>

          {/* Signature: live gradebook mock */}
          <div data-aos="fade-up" data-aos-delay={200}>
            <GradebookCard />
          </div>
        </div>
      </div>
    </section>
  );
}