import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// Swapped out Unsplash links for clean local asset paths
const gridImages = [
  {
    src: "/assets/images/homepage/generators.webp",
    alt: "Campus generators and electrical infrastructure",
  },
  {
    src: "/assets/images/homepage/elevator.webp",
    alt: "Elevator maintenance technician",
  },
  {
    src: "/assets/images/homepage/transformer.webp",
    alt: "Campus transformer and electrical distribution system",
  },
];

const stats = [
  { label: "Active Technicians", value: "24/7" },
  { label: "Avg. Response Time", value: "< 45m" },
  { label: "Resolved This Month", value: "1,200+" },
  { label: "Campus Coverage", value: "100%" },
];

function HomePage() {
  return (
    <main className="w-full">
      {/* ---- HERO SECTION (Full Screen Height) ---- */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-neutral-950 pt-23 pb-12">

        {/* 1. Grid Background Layout */}
        <div className="absolute inset-0 grid grid-cols-3 gap-1 md:gap-2 pointer-events-none opacity-30">
          {gridImages.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          ))}
        </div>

        {/* 2. Balanced overlay: light at top, subtle middle, slightly deeper base for metrics */}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/80 via-neutral-950/40 to-neutral-950/50 backdrop-blur-[1px]" />

        {/* Dummy spacer to force flex-col layout to push core text dead-center */}
        <div className="hidden lg:block" />

        {/* 3. Primary Value Proposition Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6 text-white my-auto py-14">
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-7xl tracking-tight leading-tight">
            Report and track electrical issues across campus
          </h1>

          <p className="font-light text-neutral-300 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            KCED helps the KNUST community report electrical faults and lets our
            technicians track, assign, and resolve service requests — keeping
            campus power and infrastructure running smoothly.
          </p>

          <div className="flex items-center justify-center pt-2">
            <Link
              to="/service-request-form"
              className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-950 font-medium transition-all shadow-xl"
            >
              Submit a Service Request
            </Link>
          </div>
        </div>

        {/* 4. Embedded Statistics Layer */}
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center md:border-r last:border-0 border-white/10 px-2">
                <div className="font-display font-black text-xl md:text-4xl text-white/80 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/80 mt-1 tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SECONDARY BODY CONTENT ---- */}
      <section className="bg-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight mb-4">
            Active Operations & Maintenance
          </h2>
          <p className="text-muted max-w-lg mx-auto font-light text-lg">
            Providing modern analytics and real-time support tools for campus facility dispatch teams.
          </p>
        </div>
      </section>
    </main>
  );
}