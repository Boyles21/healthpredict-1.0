import Navbar from "./Navbar";
import Hero from "./Hero";
import TrustCredibility from "./TrustCredibility";
import HowItWorks from "./HowItWorks";
import ConditionsCovered from "./ConditionsCovered";
import Features from "./Features";
import MachineLearning from "./MachineLearning";
import ResultsPreview from "./ResultsPreview";
import Faq from "./Faq";
import Disclaimer from "./Disclaimer";
import Footer from "./Footer";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div id="landing-container" className="min-h-screen bg-white">
      {/* 50. Responsive Sticky Navigation */}
      <Navbar onLogin={onLogin} onSignup={onStart} />
      
      <main className="relative">
        {/* 1. Hero Section */}
        <Hero onStart={onStart} />
        
        {/* 2. Trust & Credibility Section */}
        <TrustCredibility />
        
        {/* 3. Conditions Covered Section */}
        <ConditionsCovered />

        {/* 4. How It Works Section */}
        <HowItWorks />

        {/* 5. Key Features Section */}
        <Features />

        {/* 6. Machine Learning Architecture Section */}
        <MachineLearning />

        {/* 7. Interactive Results Preview */}
        <ResultsPreview />

        {/* 8. FAQ Section */}
        <Faq />

        {/* Quick bottom reminder layout disclaimer banner */}
        <Disclaimer />
      </main>
      
      {/* 9. Premium Footer */}
      <Footer />
    </div>
  );
}
