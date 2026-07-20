export default function LargeTestimonial() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="space-y-3 text-center">
            <div className="relative inline-flex">
              <svg
                className="absolute -left-6 -top-2 -z-10"
                width={40}
                height={49}
                viewBox="0 0 40 49"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.7976 -0.000136375L39.9352 23.4746L33.4178 31.7234L13.7686 11.4275L22.7976 -0.000136375ZM9.34947 17.0206L26.4871 40.4953L19.9697 48.7441L0.320491 28.4482L9.34947 17.0206Z"
                  fill="#D1D5DB"
                />
              </svg>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-violet-600 to-violet-400 text-base font-semibold text-white">
                JC
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              &ldquo;TrainingHub has transformed how I deliver courses. From
              managing materials to{" "}
              <em className="italic text-gray-500">tracking student progress</em>,
              it's become my go-to platform for everything.&rdquo;
            </p>
            <div className="text-sm font-medium text-gray-500">
              <span className="text-gray-700">John Carter</span>{" "}
              <span className="text-gray-400">/</span>{" "}
              <a className="text-violet-500" href="#0">
                Senior Trainer at TechCorp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
