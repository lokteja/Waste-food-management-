import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function CTASection() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleRegisterClick = () => {
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
        default:
          setLocation("/auth?tab=register");
      }
    } else {
      setLocation("/auth?tab=register");
    }
  };

  return (
    <div className="bg-primary-700" id="contact">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Ready to make a difference?</span>
          <span className="block">Join our community today.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-primary-200">
          Whether you're a volunteer, restaurant owner, or NGO, you can help us reduce food waste and fight hunger.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <Button
              onClick={handleRegisterClick}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
            >
              Register Now
              <ArrowRight className="ml-3 h-5 w-5 text-primary-500" />
            </Button>
          </div>
          <div className="ml-3 inline-flex">
            <Button
              variant="outline"
              onClick={() => setLocation("/auth?tab=login")}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
            >
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
