import brainwaveLogo from "../assets/brainwave.svg";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    description: "Explore BrainWave and bring your ideas to life.",
    price: "$0",
    period: "forever",
    features: [
      "Access to BrainWave AI",
      "Basic AI conversations",
      "Limited daily messages",
      "Conversation history",
    ],
    buttonText: "Get Started Free",
    link: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    description: "More power and flexibility for your everyday work.",
    price: "$9",
    period: "per month",
    features: [
      "Everything in Free",
      "Higher message limits",
      "Longer AI conversations",
      "Priority access to AI",
      "Advanced productivity tools",
    ],
    buttonText: "Get Started with Pro",
    link: "/signup",
    featured: true,
  },
];

function PricingPage() {
  return (
    <main className="min-h-screen bg-n-8 px-4 py-12 text-n-1 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 text-center sm:mb-16">

          <Link
            to="/"
            className="mb-8 inline-flex items-center justify-center"
          >
            <img
              src={brainwaveLogo}
              alt="BrainWave logo"
              className="h-16 w-auto object-contain sm:h-20"
            />
          </Link>


          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-color-1">
            Simple pricing
          </p>

          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            The right plan for your ideas
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-n-3 sm:text-base">
            Start for free and explore what BrainWave can do.
            Upgrade when you need more room to think, create, and build.
          </p>
        </header>

        <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 ${plan.featured
                  ? "border-color-1 bg-n-7 shadow-2xl shadow-color-1/10"
                  : "border-n-6 bg-n-7"
                }`}
            >
              {plan.featured && (
                <span className="mb-5 w-fit rounded-full bg-color-1/15 px-3 py-1 text-xs font-semibold text-color-1">
                  MOST POPULAR
                </span>
              )}

              <h2 className="text-xl font-semibold">{plan.name}</h2>

              <p className="mt-3 min-h-12 text-sm leading-6 text-n-3">
                {plan.description}
              </p>

              <div className="mt-7 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {plan.price}
                </span>
                <span className="text-sm text-n-3">{plan.period}</span>
              </div>

              <Link
                to={plan.link}
                className={`mt-7 inline-flex min-h-12 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90 ${plan.featured
                    ? "bg-color-1 text-white"
                    : "border border-n-6 bg-n-8 text-n-1 hover:border-color-1"
                  }`}
              >
                {plan.buttonText}
              </Link>

              <div className="my-7 border-t border-n-6" />

              <p className="mb-5 text-sm font-semibold">
                What's included
              </p>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-n-2"
                  >
                    <span className="mt-0.5 font-bold text-color-1">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <footer className="mt-12 text-center sm:mt-16">
          <p className="text-sm text-n-3">
            Not ready to choose?{" "}
            <Link
              to="/"
              className="font-semibold text-color-1 hover:opacity-80"
            >
              Explore BrainWave
            </Link>
          </p>

          <p className="mt-4 text-xs leading-5 text-n-4">
            Pricing and features are provisional and may change before launch.
          </p>
        </footer>
      </div>
    </main>
  );
}

export default PricingPage;
