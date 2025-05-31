import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CSATCalculator from "@/components/csat-calculator";
import PageLoader from "@/components/page-loader";
import IntrusiveAd from "@/components/intrusive-ad";
import { Button } from "@/components/ui/button";
import { Settings, Megaphone } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [showIntrusiveAd, setShowIntrusiveAd] = useState(false);
  const [showBannerAd, setShowBannerAd] = useState(true);

  // Fetch ad settings
  const { data: adSettings } = useQuery({
    queryKey: ["/api/ads/settings"],
  });

  useEffect(() => {
    // Page load animation
    const timer = setTimeout(() => {
      setShowLoader(false);
      // Show intrusive ad after loader if enabled
      if (adSettings?.intrusiveAdsEnabled !== false) {
        setTimeout(() => {
          setShowIntrusiveAd(true);
        }, 1000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [adSettings]);

  const closeBannerAd = () => {
    setShowBannerAd(false);
  };

  if (showLoader) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Intrusive Megaphone Modal */}
      <IntrusiveAd 
        isOpen={showIntrusiveAd} 
        onClose={() => setShowIntrusiveAd(false)} 
      />

      {/* Header */}
      <motion.header 
        className="gradient-bg text-white shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold">
                <i className="fas fa-chart-line mr-3"></i>
                CSAT Calculator Pro
              </h1>
              <p className="text-blue-100 mt-2">Advanced Customer Satisfaction Analytics</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link href="/admin">
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Non-intrusive Megaphone Banner */}
      {showBannerAd && adSettings?.bannerAdsEnabled !== false && (
        <motion.div 
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white py-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <span className="text-sm">
              <Megaphone className="inline w-4 h-4 mr-2" />
              📊 Boost your analytics with Premium Tools - 
            </span>
            <a href="#" className="underline hover:no-underline ml-2">Learn More</a>
            <button 
              onClick={closeBannerAd}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.main 
        className="max-w-7xl mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <CSATCalculator />
      </motion.main>
    </div>
  );
}
