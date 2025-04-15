import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleVolunteerClick = () => {
    if (user) {
      if (user.role === "volunteer") {
        setLocation("/volunteer-dashboard");
      } else {
        setLocation(`/${user.role}-dashboard`);
      }
    } else {
      setLocation("/auth?tab=register&role=volunteer");
    }
  };

  const handleNGOClick = () => {
    if (user) {
      if (user.role === "ngo") {
        setLocation("/ngo-dashboard");
      } else {
        setLocation(`/${user.role}-dashboard`);
      }
    } else {
      setLocation("/auth?tab=register&role=ngo");
    }
  };

  return (
    <div className="relative bg-gray-900 h-[500px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1546552356-3173d588941a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      ></div>
      <div className="text-center px-4 sm:px-6 lg:px-8 z-10 slide-animation">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          <span className="block">Reduce Food Waste</span>
          <span className="block text-primary-400">Feed the Hungry</span>
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-gray-300">
          Connect excess food with those who need it most. Join our mission to reduce waste and fight hunger.
        </p>
        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
            <Button
              onClick={handleVolunteerClick}
              size="lg"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 sm:px-8"
            >
              Volunteer Now
            </Button>
            <Button
              onClick={handleNGOClick}
              size="lg"
              variant="outline"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-50 sm:px-8"
            >
              Register NGO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
