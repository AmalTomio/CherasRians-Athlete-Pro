import {
  TrophyIcon,
  OrganizationIcon,
  GraphIcon,
} from "@primer/octicons-react";
import { motion } from "framer-motion";

/* ================= ANIMATION VARIANTS ================= */
const panelFade = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const formFade = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
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

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="d-flex vh-100 bg-light">
      {/* ================= LEFT: BRANDING PANEL ================= */}
      <motion.div
        className="d-none d-md-flex col-md-6 position-relative text-white overflow-hidden"
        variants={panelFade}
        initial="hidden"
        animate="visible"
        style={{ position: "relative" }}
      >
        {/* ===== IMAGE BACKGROUND ===== */}
        <div
          className="position-absolute"
          style={{
            inset: 0,
            backgroundImage: "url('/panel.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />

        {/* ===== GRADIENT OVERLAY ===== */}
        <div
          className="position-absolute"
          style={{
            inset: 0,
            background:
              "linear-gradient(135deg, #1e40af 0%, #2563eb 45%, #1e3a8a 100%)",
            opacity: 0.85,
          }}
        />

        {/* ===== DIAGONAL GLASS PANEL ===== */}
        <div
          className="position-absolute"
          style={{
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(255,255,255,0.1) 0%, transparent 65%)",
            transform: "skewX(-12deg)",
            transformOrigin: "top left",
          }}
        />

        {/* ===== GRID ===== */}
        <div
          className="position-absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.18,
          }}
        />

        {/* ===== GLOW SHAPES ===== */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 420,
            height: 420,
            top: -160,
            right: -160,
            background: "rgba(255,255,255,0.18)",
            filter: "blur(160px)",
          }}
        />
        <div
          className="position-absolute rounded-circle"
          style={{
            width: 360,
            height: 360,
            bottom: -160,
            left: -160,
            background: "rgba(96,165,250,0.35)",
            filter: "blur(180px)",
          }}
        />

        {/* ===== CONTENT ===== */}
        <motion.div
          className="position-relative z-2 d-flex flex-column justify-content-center px-4 px-lg-5 w-100"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <div style={{ maxWidth: 520 }}>
            {/* BRAND */}
            <motion.div
              variants={fadeUp}
              className="d-flex align-items-center gap-3 mb-4"
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-4"
                style={{
                  width: 68,
                  height: 68,
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <TrophyIcon size={36} />
              </div>
              <div>
                <h1 className="fw-bold mb-1 fs-3">Sport CMS</h1>
                <div className="fs-6 text-white-75">
                  Athletic Excellence Management
                </div>
              </div>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              variants={fadeUp}
              className="fw-bold lh-tight mb-3"
              style={{ fontSize: "2.75rem" }}
            >
              Elevate Your
              <br />
              Sports Management
              <br />
              Experience
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              variants={fadeUp}
              className="fs-6 text-white-75 mb-4"
              style={{ maxWidth: 480 }}
            >
              A comprehensive platform designed for coaches, players, and
              administrators to streamline sports operations.
            </motion.p>

            {/* FEATURES */}
            <motion.div
              variants={stagger}
              className="d-flex flex-column gap-3"
            >
              <Feature
                icon={<OrganizationIcon size={22} />}
                title="Team Management"
                desc="Organize players, schedules, and training sessions"
              />
              <Feature
                icon={<GraphIcon size={22} />}
                title="Performance Tracking"
                desc="Monitor attendance, results, and achievements"
              />
              <Feature
                icon={<TrophyIcon size={22} />}
                title="Multi-Role Access"
                desc="Tailored dashboards for players, coaches, and staff"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ================= RIGHT: AUTH FORM ================= */}
      <div className="col-12 col-md-6 d-flex flex-column justify-content-center px-4 px-md-5">
        <motion.div
          className="card shadow-lg border-0 rounded-4 p-4 p-md-5 mx-auto w-100"
          style={{ maxWidth: 560 }}
          variants={formFade}
          initial="hidden"
          animate="visible"
        >
          <h2
            className="fw-bold text-center mb-2"
            style={{ fontSize: "2rem" }}
          >
            {title}
          </h2>
          <p className="text-muted mb-4 text-center">{subtitle}</p>
          {children}
        </motion.div>

        {/* COPYRIGHT */}
        <motion.div
          className="text-center text-muted small mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          © {new Date().getFullYear()} CherasRians Athletes Sport System
        </motion.div>
      </div>
    </div>
  );
}

/* ================= FEATURE CARD ================= */
function Feature({ icon, title, desc }) {
  return (
    <motion.div
      variants={fadeUp}
      className="d-flex gap-3 align-items-start p-3 rounded-3"
      style={{
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center rounded-3"
        style={{
          width: 46,
          height: 46,
          background: "rgba(255,255,255,0.3)",
        }}
      >
        {icon}
      </div>

      <div>
        <div className="fw-bold fs-6">{title}</div>
        <div className="text-white-75" style={{ fontSize: "0.875rem" }}>
          {desc}
        </div>
      </div>
    </motion.div>
  );
}
