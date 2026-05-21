import "../styles/landing.css";

import LandingNavbar from "../components/Landing/LandingNavbar";
import Hero from "../components/Landing/Hero";
import Features from "../components/Landing/Features";
import Stats from "../components/Landing/Stats";
import SystemDetails from "../components/Landing/SystemDetails";
import CTA from "../components/Landing/CTA";
import Footer from "../components/Landing/Footer";

export default function LandingPage() {
  return (
    <div className="landing-page bg-dark text-light overflow-hidden">
      <LandingNavbar />
      <Hero />
      <Features />
      <Stats />
      <SystemDetails />
      <CTA />
      <Footer />
    </div>
  );
}