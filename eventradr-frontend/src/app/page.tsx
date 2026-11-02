"use client";

import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  faMusic,
  faLaugh,
  faStar,
  faArrowUpRightFromSquare,
  faCircle,
  faMoon,
  faCircleDot,
  faSun,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const H2 =
  "font-display text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.03] tracking-tight";

const searchFields = [
  { label: "Where", value: "Lagos" },
  { label: "When", value: "This weekend" },
  { label: "Budget", value: "Any price" },
];

const chips = ["This weekend", "Free", "Online", "Near me"];

const weekEvents = [
  {
    tag: "LIVE • LAGOS",
    day: "OCT",
    date: "18",
    bigWord: "AFTER HOURS",
    title: "Night Garden: Music under the palms",
    when: "Sun, 18 Oct · 7:00 PM",
    place: "Victoria Island, Lagos",
    price: "From ₦8,500",
    interested: "284",
    tone: "bg-purple text-white",
  },
  {
    tag: "LIVE • LAGOS",
    day: "OCT",
    date: "17",
    bigWord: "JOLLOF & JOKES",
    title: "Jollof & Jokes: A comedy supper",
    when: "Sat, 17 Oct · 6:30 PM",
    place: "Yaba, Lagos",
    price: "From ₦5,000",
    interested: "196",
    tone: "bg-coral text-ink",
  },
  {
    tag: "LIVE • LAGOS",
    day: "OCT",
    date: "19",
    bigWord: "SUNDAY SOCIAL",
    title: "Sunday Social: Ideas, food and people",
    when: "Mon, 19 Oct · 2:00 PM",
    place: "Ikeja, Lagos",
    price: "Free",
    interested: "412",
    tone: "bg-mint text-ink",
  },
];

const mapEvents = [
  { title: "Night Garden", when: "Sat · 7 PM", price: "From ₦8,500", color: "bg-purple" },
  { title: "Jollof & Jokes", when: "Fri · 6:30 PM", price: "From ₦5,000", color: "bg-coral" },
  { title: "Sunday Social", when: "Sun · 2 PM", price: "Free", color: "bg-mint" },
];

const mapPins = [
  { left: "72%", top: "34%", color: "bg-purple" },
  { left: "85%", top: "48%", color: "bg-coral" },
  { left: "78%", top: "68%", color: "bg-ink" },
];

const categories = [
  { name: "Music & Concerts", tone: "bg-purple text-white", icon: faMusic },
  { name: "Comedy & Shows", tone: "bg-coral text-ink", icon: faLaugh },
  { name: "Parties & Nightlife", tone: "bg-ink text-white", icon: faStar },
  { name: "Business & Networking", tone: "bg-mint text-ink", icon: faArrowUpRightFromSquare },
  { name: "Sports & Fitness", tone: "bg-lime text-ink", icon: faCircle },
  { name: "Arts & Culture", tone: "bg-[#EBE9F5] text-ink", icon: faMoon },
  { name: "Food & Drink", tone: "bg-coral text-ink", icon: faCircleDot },
  { name: "Faith & Spirituality", tone: "bg-mint text-ink", icon: faSun },
  { name: "Community & Causes", tone: "bg-lime text-ink", icon: faPlus },
  { name: "Family & Kids", tone: "bg-purple text-white", icon: faStar },
];

const knowItems = [
  {
    number: "01",
    title: "Event details checked",
    body: "Our team checks listing details, dates and venues where applicable. This isn’t a safety or quality guarantee.",
    badge: "bg-lime",
  },
  {
    number: "02",
    title: "See the real total",
    body: "See prices with buyer fees included.",
    badge: "bg-coral",
  },
  {
    number: "03",
    title: "Know the terms",
    body: "Entry requirements, ticket tiers, and refund policy appear before you commit.",
    badge: "bg-purple text-white",
  },
];

const organizeSteps = [
  { number: "01", title: "Create" },
  { number: "02", title: "Submit for review" },
  { number: "03", title: "Welcome guests" },
];

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Discover events", href: "#this-week" },
      { label: "This weekend", href: "#this-week" },
      { label: "Online events", href: "#this-week" },
    ],
  },
  {
    title: "Organizers",
    links: [
      { label: "Create an event", href: "/sign-in" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const reveal = {
  hidden: { opacity: 0, y: 34, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 150, damping: 18 });
  const ry = useSpring(0, { stiffness: 150, damping: 18 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.4), transparent 55%)`;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 14);
    rx.set((0.5 - py) * 14);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={`group ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        style={{ background: glare }}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
    </motion.div>
  );
}

function Magnetic({
  children,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 16 });
  const y = useSpring(0, { stiffness: 220, damping: 16 });

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full px-[5%] lg:px-[10%] ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({
  children,
  tone = "dark",
  showDot = true,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  showDot?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {showDot && (
        <motion.span 
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="h-1.5 w-1.5 rounded-full bg-coral" 
        />
      )}
      <p
        className={`text-[0.65rem] font-bold tracking-[0.24em] uppercase ${
          tone === "light" ? "text-white/60" : "text-purple"
        }`}
      >
        {children}
      </p>
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(heroProgress, [0, 1], [0, 110]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1, 1.08]);
  const heroTextY = useTransform(heroProgress, [0, 1], [0, -70]);
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0.25]);
  const headerShadow = useTransform(
    scrollYProgress,
    [0, 0.04],
    [
      "0 0 0 0 rgba(26,11,46,0)",
      "0 12px 32px -16px rgba(26,11,46,0.18)",
    ]
  );

  return (
    <div className="flex flex-1 flex-col bg-cream">
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-1 origin-left bg-purple"
        style={{ scaleX }}
      />
      
      <motion.header
        style={{ boxShadow: headerShadow }}
        className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md"
      >
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-ink"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
              </div>
              eventradr
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-ink/80 lg:flex">
            {["Discover events", "For organizers", "How it works"].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="relative transition hover:text-ink group"
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <Link
              href="/sign-in"
              className="hidden text-sm font-bold text-ink transition hover:opacity-70 sm:inline-flex"
            >
              Sign in
            </Link>
            <Magnetic className="inline-block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-full bg-purple px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple/90"
                >
                  Create an event
                  <span className="text-lg leading-none">→</span>
                </Link>
              </motion.div>
            </Magnetic>
          </motion.div>
        </Container>
      </motion.header>

      <main className="flex flex-1 flex-col overflow-x-hidden">
        {/* Hero */}
        <section
          ref={heroRef}
          className="bg-cream pt-10 pb-14 sm:pt-14 sm:pb-20"
        >
          <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <motion.div style={{ y: heroTextY, opacity: heroFade }}>
              <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={reveal}>
                <Eyebrow>Lagos is happening</Eyebrow>
              </motion.div>
              <motion.h1 
                variants={reveal}
                className="mt-4 font-display text-[clamp(2.8rem,8vw,4.8rem)] font-bold leading-[0.92] tracking-tighter text-ink"
              >
                Find something worth showing up for.
              </motion.h1>
              <motion.p 
                variants={reveal}
                className="mt-8 max-w-xl text-base font-medium text-ink/60 sm:text-lg"
              >
                Discover events around Lagos by date, area, budget, and what
                you’re into.
              </motion.p>

              <motion.div 
                variants={reveal}
                className="mt-10 rounded-[36px] bg-white p-2.5 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5 sm:p-3"
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <div className="grid grid-cols-1 divide-y divide-ink/5 sm:flex-1 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {searchFields.map((field) => (
                      <button
                        key={field.label}
                        type="button"
                        className="flex items-center justify-between px-4 py-3 text-left transition hover:bg-cream/50 first:rounded-t-[28px] sm:block sm:first:rounded-l-[28px] sm:first:rounded-t-none"
                      >
                        <div>
                          <span className="block text-[0.6rem] font-bold tracking-[0.2em] text-ink/40 uppercase">
                            {field.label}
                          </span>
                          <span className="mt-1 block text-sm font-bold text-ink">
                            {field.value}
                          </span>
                        </div>
                        <span className="text-ink/20 sm:hidden">▾</span>
                      </button>
                    ))}
                  </div>
                  <Magnetic className="w-full shrink-0 sm:w-auto" strength={0.25}>
                    <motion.button
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="flex h-12 w-full items-center justify-center rounded-full bg-purple text-white shadow-lg transition hover:bg-purple/90 sm:h-14 sm:w-14"
                    >
                      <span className="mr-2 text-sm font-bold sm:hidden">Explore events</span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </motion.button>
                  </Magnetic>
                </div>
              </motion.div>

              <motion.div 
                variants={reveal}
                className="mt-6 flex flex-wrap items-center gap-2.5"
              >
                {chips.map((chip, index) => (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    key={chip}
                    type="button"
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      index === 0
                        ? "bg-ink text-cream"
                        : "border border-ink/10 bg-white text-ink/60 hover:border-ink/20"
                    }`}
                  >
                    {index === 0 ? (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {chip}
                      </span>
                    ) : (
                      chip
                    )}
                  </motion.button>
                ))}
              </motion.div>
              </motion.div>
            </motion.div>

            <TiltCard className="relative aspect-square overflow-hidden rounded-[48px] shadow-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: EASE }}
                className="h-full w-full"
              >
                <motion.img
                  style={{ y: heroImageY, scale: heroImageScale }}
                  src="/hero.png"
                  alt="Eventradr Lagos Showcase"
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </TiltCard>
          </Container>
        </section>

        {/* This week in Lagos */}
        <section
          id="this-week"
          className="scroll-mt-24 bg-white py-16 sm:py-24"
        >
          <Container>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="flex flex-wrap items-end justify-between gap-6"
            >
              <div>
                <motion.div variants={reveal}>
                  <Eyebrow showDot={false}>This week in Lagos</Eyebrow>
                </motion.div>
                <motion.h2 variants={reveal} className={`${H2} mt-4 max-w-2xl text-ink`}>
                  Plans for the week, without the endless scroll.
                </motion.h2>
              </div>
              <motion.a
                variants={reveal}
                whileHover={{ x: 5 }}
                href="#this-week"
                className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:border-ink/20"
              >
                View all events <span className="text-purple" aria-hidden>→</span>
              </motion.a>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {weekEvents.map((event) => (
                <motion.article
                  variants={reveal}
                  whileHover={{ y: -10 }}
                  key={event.title}
                  className="group flex flex-col rounded-[40px] bg-white p-2.5 shadow-[0_32px_64px_-16px_rgba(26,11,46,0.1)] ring-1 ring-ink/5"
                >
                  <div className={`relative aspect-[1.1/1] overflow-hidden rounded-[32px] p-6 sm:p-8 ${event.tone}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.6rem] font-bold tracking-[0.2em] uppercase opacity-60 sm:text-[0.65rem]">
                        {event.tag}
                      </span>
                      <div className="rounded-2xl bg-white px-2.5 py-1.5 text-center leading-none text-ink shadow-sm sm:px-3 sm:py-2">
                        <span className="block text-[0.5rem] font-bold tracking-[0.16em] opacity-40 uppercase sm:text-[0.55rem]">
                          {event.day}
                        </span>
                        <span className="mt-1 block font-display text-base font-bold sm:text-lg">
                          {event.date}
                        </span>
                      </div>
                    </div>
                    <div className="mt-auto pt-8 sm:pt-12">
                      <p className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[0.9] tracking-tighter uppercase">
                        {event.bigWord.split(' ').map((word, i) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 pt-6 pb-4 sm:px-5">
                    <h3 className="font-display text-lg font-bold leading-tight text-ink sm:text-xl">
                      {event.title}
                    </h3>
                    <div className="mt-3 space-y-0.5 text-[0.8rem] font-medium text-ink/40 sm:text-sm">
                      <p>{event.when}</p>
                      <p>{event.place}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-[0.8rem] font-bold sm:text-sm">
                      <span className="text-ink">
                        {event.price}
                      </span>
                      <span className="text-purple/60">
                        {event.interested} interested
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-between"
            >
              <p className="text-center text-sm font-medium text-ink/30 sm:text-left">
                Prices include buyer fees. Sold-out events stay visible.
              </p>
              <a
                href="#this-week"
                className="flex w-full items-center justify-between rounded-full border border-ink/10 bg-white px-6 py-4 text-sm font-bold text-ink transition hover:border-ink/20 sm:hidden"
              >
                View all events
                <span className="text-purple" aria-hidden>→</span>
              </a>
            </motion.div>
          </Container>
        </section>

        {/* Map, grid or split */}
        <section className="bg-mint py-20 sm:py-32">
          <Container className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={reveal}>
                <Eyebrow showDot={false}>MAP, GRID OR SPLIT</Eyebrow>
              </motion.div>
              <motion.h2 variants={reveal} className={`${H2} mt-6 text-ink`}>
                Explore the city your way.
              </motion.h2>
              <motion.p variants={reveal} className="mt-8 max-w-sm text-base font-medium text-ink/60 leading-relaxed">
                Explore by map or grid, or see both in Split view. Keep your
                dates, filters and area when you switch.
              </motion.p>
              
              <motion.div variants={reveal} className="mt-10 inline-flex rounded-full bg-white p-1.5 shadow-sm">
                <button className="rounded-full bg-ink px-8 py-2.5 text-sm font-bold text-cream">
                  Map
                </button>
                <button className="px-8 py-2.5 text-sm font-bold text-ink/40 hover:text-ink transition">
                  Split
                </button>
              </motion.div>

              <motion.div variants={reveal} className="mt-12 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3.5 shadow-sm ring-1 ring-ink/5">
                <motion.span 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="h-1.5 w-1.5 rounded-full bg-coral" 
                />
                <p className="text-sm font-medium text-ink/70">
                  No matches? Try another date, area or budget.
                </p>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="overflow-hidden rounded-[48px] bg-white shadow-[0_48px_80px_-32px_rgba(26,11,46,0.15)] ring-1 ring-ink/5"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Event List */}
                <div className="w-full border-b border-ink/5 p-8 sm:w-64 sm:border-b-0 sm:border-r">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">18 events</h3>
                    <p className="mt-1 text-xs font-medium text-ink/40">Victoria Island · This weekend</p>
                  </div>
                  
                  <div className="mt-8 space-y-6">
                    {mapEvents.map((event) => (
                      <motion.div 
                        whileHover={{ x: 5 }}
                        key={event.title} 
                        className="flex gap-4 cursor-pointer"
                      >
                        <div className={`h-10 w-10 shrink-0 rounded-xl ${event.color}`} />
                        <div>
                          <p className="text-sm font-bold text-ink">{event.title}</p>
                          <p className="mt-0.5 text-[0.7rem] font-medium text-ink/40">{event.when}</p>
                          <p className="mt-1 text-xs font-bold text-purple">{event.price}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Map Graphic */}
                <div className="relative flex-1 bg-[#F1F0F7] p-4 min-h-[400px]">
                  <div className="absolute inset-0 overflow-hidden opacity-40">
                    <svg className="h-full w-full" viewBox="0 0 400 300" fill="none">
                      <path d="M-50 150C50 150 100 250 250 250C400 250 450 100 500 100" stroke="#D1CFE2" strokeWidth="24" />
                      <path d="M150 -50C150 50 250 100 250 250C250 400 100 450 100 500" stroke="#D1CFE2" strokeWidth="24" />
                      <path d="M300 -50C300 100 200 150 200 300" stroke="#D1CFE2" strokeWidth="24" />
                    </svg>
                  </div>

                  <div className="absolute top-6 left-6">
                    <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-sm ring-1 ring-ink/5">
                      Victoria Island
                      <span className="text-purple">▾</span>
                    </button>
                  </div>

                  {mapPins.map((pin, i) => (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      key={i}
                      className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                      style={{ left: pin.left, top: pin.top }}
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                        className={`h-6 w-6 rounded-full border-4 border-white shadow-lg ${pin.color}`} 
                      />
                    </motion.div>
                  ))}

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute top-[25%] right-[10%] w-48 rounded-[24px] bg-white p-4 shadow-xl ring-1 ring-ink/5"
                  >
                    <span className="text-[0.55rem] font-bold tracking-[0.2em] text-purple uppercase">
                      Details checked
                    </span>
                    <h4 className="mt-1 font-display text-lg font-bold text-ink">Night Garden</h4>
                    <p className="mt-1 text-[0.7rem] font-medium text-ink/40">Sat · 7 PM · From ₦8,500</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Browse by interest */}
        <section className="bg-cream py-24 sm:py-32">
          <Container>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-wrap items-end justify-between gap-10"
            >
              <div>
                <motion.div variants={reveal}>
                  <Eyebrow showDot={false}>BROWSE BY INTEREST</Eyebrow>
                </motion.div>
                <motion.h2 variants={reveal} className={`${H2} mt-6 max-w-xl text-ink`}>
                  Whatever you’re into, start there.
                </motion.h2>
              </div>
              <motion.p variants={reveal} className="max-w-xs text-base font-medium text-ink/40 leading-relaxed">
                From big nights out to the rooms where your next idea starts.
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
            >
              {categories.map((category) => (
                <motion.a
                  variants={reveal}
                  whileHover={{ y: -5, scale: 1.02 }}
                  key={category.name}
                  href="#this-week"
                  className={`group flex aspect-[1.3/1] flex-col justify-between rounded-[24px] p-6 transition-all hover:shadow-xl ${category.tone}`}
                >
                  <div className="flex items-start justify-between">
                    <motion.div 
                      whileHover={{ rotate: 15 }}
                      className="text-xl"
                    >
                      <FontAwesomeIcon icon={category.icon} />
                    </motion.div>
                    <span className="text-sm font-bold opacity-40 group-hover:opacity-100 transition" aria-hidden>
                      →
                    </span>
                  </div>
                  <span className="font-display text-base font-bold leading-tight">
                    {category.name}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* Know before you go */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-ink py-24 text-cream sm:py-32"
        >
          <Container>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-wrap items-end justify-between gap-10"
            >
              <div>
                <motion.div variants={reveal}>
                  <Eyebrow tone="light" showDot={false}>KNOW BEFORE YOU GO</Eyebrow>
                </motion.div>
                <motion.h2 variants={reveal} className={`${H2} mt-6 max-w-xl text-white`}>
                  Less guessing.<br />Better plans.
                </motion.h2>
              </div>
              <motion.p variants={reveal} className="max-w-sm text-base font-medium text-white/40 leading-relaxed">
                Check event details, prices and refund terms before you book.
              </motion.p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {knowItems.map((item) => (
                <motion.div
                  variants={reveal}
                  whileHover={{ y: -10 }}
                  key={item.number}
                  className="relative flex flex-col rounded-[40px] bg-white p-8 text-ink shadow-2xl sm:p-10"
                >
                  <div className="flex items-center justify-between">
                    <motion.span
                      whileInView={{ scale: [0, 1.2, 1] }}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold ${item.badge}`}
                    >
                      {item.number}
                    </motion.span>
                    <div className="h-6 w-6 text-purple opacity-40">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 4V20M12 4L4 12M12 4L20 12" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-bold leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-ink/40">{item.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </Container>
        </section>

        {/* Plan together + For organizers */}
        <section id="organizers" className="scroll-mt-24 bg-white py-24 sm:py-32">
          <Container className="grid gap-8 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col rounded-[48px] bg-coral p-10 text-ink sm:p-12"
            >
              <Eyebrow showDot={false}>PLAN TOGETHER</Eyebrow>
              <h2 className={`${H2} mt-8 max-w-md text-ink`}>
                Keep the plan.<br />Share the moment.
              </h2>
              <p className="mt-8 max-w-md text-base font-medium leading-relaxed text-ink/60">
                Mark an event Interested, send the link on WhatsApp, and come
                back when the group is ready.
              </p>
              
              <motion.div 
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 rounded-[32px] bg-white p-6 shadow-xl"
              >
                <div className="space-y-4">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex"
                  >
                    <div className="rounded-[20px] bg-[#F1F0F7] px-5 py-3.5 text-sm font-medium">
                      Night Garden this Saturday? 👀
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-end"
                  >
                    <div className="rounded-[20px] bg-ink px-5 py-3.5 text-sm font-medium text-white">
                      I’m interested. Send the link.
                    </div>
                  </motion.div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-between rounded-[20px] bg-lime px-6 py-4 text-sm font-bold shadow-sm transition hover:opacity-90"
                  >
                    Share event
                    <span aria-hidden>→</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col rounded-[48px] bg-purple p-10 text-white sm:p-12"
            >
              <Eyebrow tone="light" showDot={false}>FOR ORGANIZERS</Eyebrow>
              <h2 className={`${H2} mt-8 max-w-md text-white`}>
                Bring the right<br />people into the room.
              </h2>
              <p className="mt-8 max-w-md text-base font-medium leading-relaxed text-white/60">
                Create a clear event page, submit it for review, sell tickets,
                and check guests in from one responsive workspace.
              </p>
              
              <motion.div 
                initial="hidden"
                whileInView="visible"
                variants={stagger}
                className="mt-12 grid grid-cols-3 gap-3"
              >
                {organizeSteps.map((step) => (
                  <motion.div 
                    variants={reveal}
                    whileHover={{ scale: 1.05 }}
                    key={step.number} 
                    className="col-span-3 rounded-[24px] bg-white p-5 text-ink shadow-sm sm:col-span-1"
                  >
                    <span className="text-[0.65rem] font-bold tracking-[0.1em] text-purple uppercase">
                      {step.number}
                    </span>
                    <p className="mt-2 text-sm font-bold leading-tight">
                      {step.title}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10"
              >
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 text-sm font-bold text-ink shadow-xl transition hover:bg-cream"
                >
                  Create an event
                  <span className="text-lg" aria-hidden>→</span>
                </Link>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Call to action */}
        <section className="bg-lime py-24 sm:py-32 overflow-hidden">
          <Container className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Eyebrow showDot={false}>YOUR NEXT PLAN STARTS HERE</Eyebrow>
              <h2 className="mt-8 max-w-2xl font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[0.9] tracking-tighter text-ink">
                What are you doing this weekend?
              </h2>
            </motion.div>
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col gap-8 lg:max-w-xs lg:items-end"
            >
              <Magnetic className="inline-block" strength={0.3}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="#this-week"
                    className="inline-flex items-center gap-4 rounded-full bg-purple px-10 py-5 text-sm font-bold text-white shadow-2xl transition hover:bg-purple/90"
                  >
                    Explore events <span className="text-lg" aria-hidden>→</span>
                  </Link>
                </motion.div>
              </Magnetic>
              <p className="text-right text-sm font-medium text-ink/40">
                Browse without an account. Sign in to mark interest or book.
              </p>
            </motion.div>
          </Container>
        </section>
      </main>

      <footer className="bg-ink pt-24 pb-12 text-cream">
        <Container>
          <div className="grid gap-12 sm:gap-16 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="col-span-full lg:col-span-1"
            >
              <Link
                href="/"
                className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                </div>
                eventradr
              </Link>
              <p className="mt-6 max-w-xs text-sm font-medium text-white/40">
                Find something worth showing up for.
              </p>
            </motion.div>
            {footerColumns.map((column, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={column.title} 
                className="col-span-full sm:col-span-1"
              >
                <p className="text-[0.65rem] font-bold tracking-[0.2em] text-white/30 uppercase">
                  {column.title}
                </p>
                <ul className="mt-6 space-y-4 text-sm font-medium text-white/60">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-col gap-6 border-t border-white/5 pt-10 text-xs font-medium text-white/30 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>© 2026 Eventradr. · Lagos time</p>
            <p>Africa/Lagos</p>
          </motion.div>
        </Container>
      </footer>
    </div>
  );
}
