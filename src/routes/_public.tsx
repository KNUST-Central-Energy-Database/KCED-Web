import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/_public")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <header className="flex md:grid grid-cols-1 md:grid-cols-3 transition-all duration-300 md:border-b border-primary">
        <Link to="/" className="flex-1 flex items-center space-x-3 pt-4 md:pt-8 px-4 md:px-10 pb-8 md:pb-12 md:bg-primary-soft">
          <img
            src="/assets/images/knust-logo.png"
            alt="KNUST Crest"
            className="h-16 w-auto md:h-22"
          />
          <div className="pt-4 flex flex-col">
            <h1 className="font-garamond font-semibold text-2xl md:text-3xl tracking-tight m-0 leading-tight">
              KNUST
            </h1>
            <p className="not-md:text-xs font-medium m-0 -mt-0.5 leading-normal">
              Central Energy Database
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-end col-span-2 px-6 md:px-10">
          <Link
            to="/login"
            className={`px-4 md:px-6 py-2 rounded-4xl font-display text-sm md:text-lg font-medium transition-colors hover:text-white flex gap-1 items-center hover:bg-primary border border-black hover:border-primary`}
          >
            Log in
            <LogIn className="w-4.5 h-4.5" strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      <main className="w-full">
        <section className="relative w-full min-h-screen flex flex-col md:grid grid-cols-1 md:grid-cols-3">
          <div className="md:sticky md:top-0 md:h-screen p-4 md:p-10 bg-primary-soft">
            <h2 className="font-sans text-3xl font-normal md:text-5xl md:leading-14 tracking-tight">
              Service & Maintenance Requests
            </h2>
          </div>

          <div className="flex flex-col gap-12 md:gap-24 py-10 md:px-38 col-span-2 items-center">

            {/* Non-urgent */}
            <div className="w-full flex flex-col gap-4 not-md:px-4">
              <h2 className="font-sans text-3xl font-normal md:text-5xl tracking-tight">
                Non-urgent service request
              </h2>
              <p className="leading-relaxed max-w-prose text-lg">
                For routine issues that don't require immediate attention — broken fixtures,
                lighting faults, minor electrical faults, etc.
              </p>
              <ul className="leading-relaxed list-disc marker:text-2xl px-6 marker:text-primary space-y-1 text-lg">

                <li>
                  Submit a request {" "}
                  <Link
                    to="/service-request-form"
                    className="font-medium underline"
                  >
                    here
                  </Link>
                </li>
                <li>
                  Email{" "}
                  <a href="mailto:kcedsample@knust.edu.gh" className="underline font-medium">
                    kcedsample@knust.edu.gh
                  </a>{" "}
                  — monitored Mon–Fri, 9am–5pm only.
                </li>
                <li>Visit the Electrical Unit at <span className="font-medium">Maintenance Yard, Commercial Area, KNUST</span>.</li>
              </ul>


            </div>

            {/* Emergency */}
            <div className="w-full flex flex-col gap-4 not-md:px-4">
              <h2 className="font-sans text-3xl font-normal md:text-5xl tracking-tight">
                Immediate emergency request
              </h2>
              <p className="leading-relaxed max-w-prose text-lg">
                For urgent issues posing a safety risk — exposed wiring, power outages,
                equipment failures, etc. Available 24/7.
              </p>
              <ul className="leading-relaxed list-disc px-6 marker:text-2xl marker:text-primary space-y-1 text-lg">
                <li>Move to safety and locate the nearest security post. Move to safety and locate the nearest security post. Move to safety and locate the nearest security post.</li>
                <li>
                  For life-threatening emergencies, call{" "}
                  <a href="tel:191" className="font-medium underline">
                    191
                  </a>{" "}
                  (Ghana Police/Fire).
                </li>
                <li>
                  Call KNUST Security on{" "}
                  <a href="tel:0501347350" className="font-medium underline">
                    0501347350
                  </a>.
                </li>

              </ul>
            </div>

            {/* Planned maintenance */}
            <div className="w-full flex flex-col gap-4 not-md:px-4">
              <h2 className="font-sans text-3xl font-normal md:text-5xl tracking-tight">
                Planned maintenance
              </h2>
              <p className="leading-relaxed max-w-prose text-lg">
                Throughout the academic year, the KNUST Electrical Unit may carry out scheduled maintenance and upgrades to electrical fixtures, lighting systems, and building controls across campus. Work will be communicated to affected departments or halls in advance, and every effort will be made to minimise disruption to academic activities.
              </p>
            </div>

            {/* Track your request */}
            <div className="w-full flex flex-col gap-4 not-md:px-4">
              <h2 className="font-sans text-3xl font-normal md:text-5xl tracking-tight">
                Track your request
              </h2>
              <p className="leading-relaxed max-w-prose text-lg">
                After submitting a request, you'll receive a confirmation with a reference number.
                Use KCED to check the status of your work order at any time.
              </p>

              <Link
                to="/track-service-request"
                className="mt-2 inline-flex items-center gap-2 font-medium underline underline-offset-4 text-lg"
              >
                Track your request →
              </Link>
            </div>

          </div>
        </section >

        {/* Footer */}
        <footer className="bg-primary-soft/70 p-6 md:p-14 flex flex-col md:items-end md:flex-row not-md:space-y-13 text-sm md:text-base">
          <Link to="/" className="flex-1 flex items-center space-x-3">
            <img
              src="/assets/images/knust-logo.png"
              alt="KNUST Crest"
              className="h-11 w-auto md:h-22"
            />
            <div className="pt-4 flex flex-col">
              <h1 className="font-garamond font-semibold text-xl md:text-3xl tracking-tight m-0 leading-tight">
                KNUST
              </h1>
              <p className="font-medium m-0 -mt-0.5 leading-normal not-md:text-sm">
                Central Energy Database
              </p>
            </div>
          </Link>

          <div className="flex-1 space-y-2 md:space-y-4">
            <div>
              <p>Maintenance Yard, Commercial Area</p>
              <p>KNUST, Kumasi</p>
            </div>

            <a href="https://www.knust.edu.gh" target="_blank" className="underline decoration-primary">
              Kwame Nkrumah University of Science and Technology (KNUST)
            </a>
          </div>

          <p>&copy; {new Date().getFullYear()} KNUST Electrical Unit — Maintenance Yard, Commercial Area</p>
        </footer>
      </main >
    </>
  );
}
