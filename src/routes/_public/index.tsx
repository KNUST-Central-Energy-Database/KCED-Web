import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import GooglePlay from "../../../public/assets/images/homepage/googleplay.svg";
import AppStore from "../../../public/assets/images/homepage/appstore.svg";
import PhoneMockup from "../../../public/assets/images/homepage/phone mockup.svg";

export const Route = createFileRoute("/_public/")({
  component: HomePage,
});

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

const steps = [
  {
    number: "01",
    title: "Submit a Request",
    description:
      "Fill out a quick form describing the fault — what it is, where it is, and how to reach you.",
  },
  {
    number: "02",
    title: "We Assign a Technician",
    description:
      "Your request is logged in KCED and assigned to the right technician for your area.",
  },
  {
    number: "03",
    title: "Issue Resolved",
    description:
      "The technician responds, fixes the fault, and the request is closed — with a full record kept.",
  },
];

const faqs = [
  {
    question: "Who can submit a service request?",
    answer:
      "Anyone on KNUST campus — students, staff, and faculty — can submit a request for any electrical fault they encounter in a campus building or facility.",
  },
  {
    question: "How long does it take to get a response?",
    answer:
      "Our average response time is under 45 minutes for standard requests. Critical faults are prioritised and escalated immediately.",
  },
  {
    question: "What counts as an emergency?",
    answer:
      "Exposed live wires, fire hazards, complete power failures in critical areas, or anything posing immediate danger. Do NOT use this form for emergencies — call the emergency line directly.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left py-5 flex items-center justify-between gap-4 text-ink hover:text-primary transition-colors"
      >
        <span className="font-display font-bold text-xl md:text-2xl">
          {question}
        </span>
        <span className="text-2xl leading-none shrink-0 text-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p className="pb-5 text-muted font-light text-base leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}

function HomePage() {
  return (
    <main className="w-full">
      {/* ---- HERO ---- */}
      <section className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-neutral-950 pt-23 pb-12">
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
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/80 via-neutral-950/40 to-neutral-950/50 backdrop-blur-[1px]" />
        <div className="hidden lg:block" />
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
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center md:border-r last:border-0 border-white/10 px-2"
              >
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

      {/* ---- HOW IT WORKS ---- */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-ink tracking-tight">
              How it works
            </h2>
            <p className="text-muted font-light mt-3 text-lg">
              Reporting a fault takes less than two minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-start gap-4"
              >
                <span className="font-display font-black text-6xl text-primary/20 leading-none">
                  {step.number}
                </span>
                <h3 className="font-display font-bold text-2xl text-ink">
                  {step.title}
                </h3>
                <p className="text-muted font-light text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- GET THE APP ---- */}
      <section className="bg-neutral-950 py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          {/* Text content layout framework */}
          <div className="flex-1 text-center md:text-left space-y-6">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white tracking-tight">
              Manage everything from your phone
            </h2>
            <p className="text-neutral-400 font-light leading-relaxed text-lg">
              The KCED mobile app gives technicians and admins a full dashboard
              on the go — assign work orders, update asset status, and track
              service requests in real time.
            </p>

            {/* Integrated Buttons + QR Code Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
              <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 transition-colors border border-white/10 text-white rounded-lg px-5 py-3"
                >
                  <img src={GooglePlay} alt="Google Play" height={24} width={24} />
                  <div className="text-left">
                    <div className="text-[10px] text-neutral-400 leading-none">
                      Get it on
                    </div>
                    <div className="text-sm font-semibold leading-tight">
                      Google Play
                    </div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 transition-colors border border-white/10 text-white rounded-lg px-5 py-3"
                >
                  <img src={AppStore} alt="App Store" height={24} width={24} />
                  <div className="text-left">
                    <div className="text-[10px] text-neutral-400 leading-none">
                      Download on the
                    </div>
                    <div className="text-sm font-semibold leading-tight">
                      App Store
                    </div>
                  </div>
                </a>
              </div>

              {/* QR Code repositioned inside download row frame */}
              <div className="flex flex-col items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-22 h-22 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <span className="text-[8px] text-neutral-500 text-center font-medium tracking-tight px-1 leading-tight">
                    QR Code
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white leading-tight">Scan to download</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 leading-none">iOS & Android app</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scaled-up Phone Mockup Container */}
          <div className="shrink-0 md:w-1/2 flex justify-center items-center">
            <img
              src={PhoneMockup}
              alt="KCED app on iPhone"
              className="h-[450px] md:h-[520px] w-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)] transform md:translate-y-4"
            />
          </div>
        </div>
      </section>

      {/* ---- FAQ TEASER ---- */}
      <section className="bg-white py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-ink tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/faqs"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              See all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* ---- EMERGENCY CONTACT STRIP ---- */}
      <section className="bg-red-600 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-6 text-white">
          <div className="shrink-0 text-center sm:text-left">
            <p className="font-bold text-base">⚠ Electrical emergency?</p>
            <p className="font-light text-red-100 text-sm mt-0.5">
              Do not use the service request form. Call directly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
            <a
              href="tel:192"
              className="flex flex-col items-center bg-white/15 hover:bg-white/25 border border-white/20 transition-colors rounded-lg px-5 py-2.5 text-center"
            >
              <span className="text-[10px] text-red-200 uppercase tracking-wider leading-none mb-1">
                Fire Service
              </span>
              <span className="font-bold text-sm">192</span>
            </a>
            <a
              href="tel:+233322060826"
              className="flex flex-col items-center bg-white/15 hover:bg-white/25 border border-white/20 transition-colors rounded-lg px-5 py-2.5 text-center"
            >
              <span className="text-[10px] text-red-200 uppercase tracking-wider leading-none mb-1">
                KNUST Security
              </span>
              <span className="font-bold text-sm">+233 32 206 0826</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}