import {
  TrophyIcon,
  OrganizationIcon,
  GraphIcon,
  PulseIcon,
  FlameIcon
} from "@primer/octicons-react";
import { motion } from "framer-motion";

/* ================= ANIMATION VARIANTS ================= */
const panelFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const formFade = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const floatAnim = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="d-flex vh-100" style={{ backgroundColor: "#f8fafc" }}>
      
      {/* ================= LEFT: IMMERSIVE SPORTS-TECH PANEL ================= */}
      <motion.div
        className="d-none d-lg-flex col-lg-6 position-relative text-white overflow-hidden"
        variants={panelFade}
        initial="hidden"
        animate="visible"
        style={{
          background: "#020617", // Deep sleek dark base
        }}
      >
        {/* ===== DYNAMIC GLOWS (Vibrant Cyan & Electric Blue) ===== */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="position-absolute rounded-circle"
          style={{
            width: 600,
            height: 600,
            top: "-10%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(0, 198, 255, 0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="position-absolute rounded-circle"
          style={{
            width: 700,
            height: 700,
            bottom: "-20%",
            right: "-20%",
            background: "radial-gradient(circle, rgba(0, 114, 255, 0.4) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />

        {/* ===== TECH GRID & TRACK LINES ===== */}
        <div
          className="position-absolute inset-0 w-100 h-100"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            zIndex: 1,
          }}
        />
        <svg className="position-absolute w-100 h-100" style={{ zIndex: 1, opacity: 0.2 }}>
          <path d="M-100 200 C 300 400, 600 -100, 1000 300" fill="none" stroke="url(#cyan-grad)" strokeWidth="2" />
          <path d="M-100 220 C 300 420, 600 -80, 1000 320" fill="none" stroke="url(#cyan-grad)" strokeWidth="1" opacity="0.5" />
          <defs>
            <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
          </defs>
        </svg>

        {/* ===== CONTENT CONTAINER ===== */}
        <div className="position-relative z-3 w-100 d-flex flex-column justify-content-center px-5">
          <motion.div variants={stagger} initial="hidden" animate="visible" style={{ maxWidth: 580 }}>
            
            {/* BRAND */}
            <motion.div variants={fadeUp} className="d-flex align-items-center gap-3 mb-5">
              <div
                className="d-flex align-items-center justify-content-center rounded-4 shadow-lg"
                style={{
                  width: 56, height: 56,
                  background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
                }}
              >
                <TrophyIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="fw-bolder mb-0 fs-4 text-white tracking-wide" style={{ letterSpacing: "1px" }}>
                  CHERASRIANS
                </h1>
                <div className="text-info fw-semibold" style={{ fontSize: "0.85rem", letterSpacing: "2px" }}>
                  ATHLETES PRO
                </div>
              </div>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              variants={fadeUp}
              className="fw-bold mb-4 text-white"
              style={{ fontSize: "3.5rem", lineHeight: "1.1" }}
            >
              Elite <span style={{ color: "#00f2fe" }}>Performance.</span>
              <br />
              Precision Control.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="fs-5 mb-5"
              style={{ color: "rgba(255,255,255,0.7)", maxWidth: "90%" }}
            >
              The definitive AI-powered platform for next-generation sports management, athlete tracking, and coaching analytics.
            </motion.p>

            {/* SPORTS HUD FLOATING CARDS */}
            <motion.div 
              variants={fadeUp} 
              className="position-relative mt-4"
              style={{ height: "180px" }}
            >
              {/* HUD Card 1 */}
              <motion.div
                variants={floatAnim}
                initial="initial"
                animate="animate"
                className="position-absolute p-3 rounded-4 shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  width: "220px",
                  top: 0, left: 0,
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <PulseIcon size={16} className="text-info" />
                  <span className="text-white-50 small fw-semibold">Live Metrics</span>
                </div>
                <div className="fw-bold text-white fs-4">Peak Output</div>
                <div className="progress mt-2" style={{ height: "4px", background: "rgba(255,255,255,0.1)" }}>
                  <div className="progress-bar" style={{ width: "85%", background: "linear-gradient(90deg, #00f2fe, #4facfe)" }}></div>
                </div>
              </motion.div>

              {/* HUD Card 2 */}
              <motion.div
                variants={floatAnim}
                initial="initial"
                animate="animate"
                className="position-absolute p-3 rounded-4 shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  width: "200px",
                  top: "40px", left: "250px",
                  animationDelay: "1s"
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FlameIcon size={16} className="text-warning" />
                  <span className="text-white-50 small fw-semibold">Readiness</span>
                </div>
                <div className="fw-bold text-white fs-3">98<span className="fs-6 text-white-50">%</span></div>
                <div className="text-success small fw-semibold mt-1">↑ 2.4% vs last week</div>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>

      {/* ================= RIGHT: AUTH FORM ================= */}
      <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-center px-4 py-5 position-relative">
        <motion.div
          className="w-100"
          style={{ maxWidth: "480px" }}
          variants={formFade}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="d-flex d-lg-none align-items-center gap-3 mb-5 justify-content-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-4 shadow-sm"
              style={{ width: 48, height: 48, background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)" }}
            >
              <TrophyIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="fw-bolder mb-0 fs-5 text-dark tracking-wide">CHERASRIANS</h1>
              <div className="text-primary fw-semibold" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>ATHLETES PRO</div>
            </div>
          </div>

          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2" style={{ fontSize: "2.25rem" }}>
              {title}
            </h2>
            <p className="text-secondary fs-6">{subtitle}</p>
          </div>

          {children}

        </motion.div>

        {/* COPYRIGHT */}
        <div className="position-absolute bottom-0 mb-4 text-center w-100 text-muted small fw-medium">
          © {new Date().getFullYear()} CherasRians Athletes Pro. All rights reserved.
        </div>
      </div>
    </div>
  );
}