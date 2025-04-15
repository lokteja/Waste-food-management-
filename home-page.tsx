import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import HeroSection from "@/components/home/hero-section";
import StatsSection from "@/components/home/stats-section";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Fetch stats for the stats section
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
  
  // If user is logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "volunteer":
          setLocation("/volunteer-dashboard");
          break;
        case "ngo":
          setLocation("/ngo-dashboard");
          break;
        case "admin":
          setLocation("/admin-dashboard");
          break;
      }
    }
  }, [user, setLocation]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        
        <StatsSection 
          mealsSaved={stats?.totalMealsSaved || 15000}
          activeVolunteers={stats?.activeVolunteers || 300}
          partnerNGOs={stats?.partnerNGOs || 50}
        />
        
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
