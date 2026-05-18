import { Activity } from "lucide-react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import Disclaimer from "./Disclaimer";
import Footer from "./Footer";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar onLogin={onLogin} onSignup={onStart} />
      <main>
        <Hero onStart={onStart} />
        <HowItWorks />
        <Features />
        <Disclaimer />
      </main>
      <Footer />
    </div>
  );
}
