const features = [
  {
    title: "Course Management",
    description:
      "Create, organize, and manage training courses with structured lessons and materials tailored to your curriculum.",
    icon: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  {
    title: "Exam System",
    description:
      "Build exams with multiple-choice and essay questions. MC questions are auto-graded, essays flagged for trainer review.",
    icon: (
      <>
        <path
          d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path
          d="m9 14 2 2 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  {
    title: "Student Enrollment",
    description:
      "Enroll students into courses, track enrollment status, and manage who has access to what content.",
    icon: (
      <>
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="9"
          cy="7"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M22 21v-2a4 4 0 0 0-3-3.87"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  {
    title: "Learning Materials",
    description:
      "Upload and organize PDFs, presentations, and resources for each lesson to keep students engaged.",
    icon: (
      <>
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polyline
          points="14 2 14 8 20 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="16"
          y1="13"
          x2="8"
          y2="13"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="16"
          y1="17"
          x2="8"
          y2="17"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
  {
    title: "Statistics & Analytics",
    description:
      "Track student performance, pass rates, question accuracy, and identify areas needing attention.",
    icon: (
      <>
        <path d="M18 20V10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 20V4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M6 20v-6" fill="none" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  },
  {
    title: "Role-Based Access",
    description:
      "Admin, Trainer, and Student roles with tailored permissions and personalized dashboards for each user type.",
    icon: (
      <>
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </>
    ),
  },
];

export default function FeaturesPlanet() {
  return (
    <section id="features" className="relative bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="py-16 md:py-24">
          <div className="mb-14 max-w-xl">
            <p className="mb-3 text-sm font-semibold tracking-wide text-violet-400 uppercase">
              The syllabus
            </p>
            <h2 className="text-3xl font-bold text-gray-100 md:text-4xl">
              Everything on the course roster
            </h2>
          </div>

          <ol className="divide-y divide-gray-800 border-y border-gray-800">
            {features.map((f, i) => (
              <li
                key={f.title}
                className="group grid grid-cols-[2.5rem_1fr] items-start gap-x-4 py-6 transition-colors hover:bg-gray-800/40 sm:grid-cols-[2.5rem_1fr_16rem]"
                data-aos="fade-up"
                data-aos-delay={i * 60}
              >
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    {f.icon}
                  </svg>
                </span>
                <h3 className="font-medium text-gray-100 sm:col-span-1">
                  {f.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-gray-400">
                  {f.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
