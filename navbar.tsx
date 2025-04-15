import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const redirectToDashboard = () => {
    if (user) {
      switch (user.role) {
        case "volunteer":
          return "/volunteer-dashboard";
        case "ngo":
          return "/ngo-dashboard";
        case "admin":
          return "/admin-dashboard";
        default:
          return "/";
      }
    }
    return "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                    />
                  </svg>
                  <span className="ml-2 text-xl font-bold text-gray-900 font-heading">
                    FoodShare
                  </span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location === "/"
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Home
                </a>
              </Link>
              <a
                href="#about"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                About Us
              </a>
              <a
                href="#how-it-works"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                How It Works
              </a>
              <a
                href="#contact"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative flex items-center space-x-4">
              {user ? (
                <>
                  <Link href={redirectToDashboard()}>
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <a className="text-gray-500 hover:text-gray-700 font-medium">
                      Login
                    </a>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button>Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col pt-8">
                <div className="space-y-2">
                  <Link href="/">
                    <a
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        location === "/"
                          ? "bg-primary-50 border-primary-500 text-primary-700"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                  </Link>
                  <a
                    href="#about"
                    className="block px-3 py-2 rounded-md text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </a>
                  <a
                    href="#how-it-works"
                    className="block px-3 py-2 rounded-md text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How It Works
                  </a>
                  <a
                    href="#contact"
                    className="block px-3 py-2 rounded-md text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {user ? (
                    <div className="space-y-2">
                      <Link href={redirectToDashboard()}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/auth">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth?tab=register">
                        <Button
                          className="w-full"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
