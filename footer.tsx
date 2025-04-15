import { Link } from "wouter";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
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
              <span className="ml-2 text-xl font-bold">FoodShare</span>
            </div>
            <p className="mt-4 text-base text-gray-300">
              Reducing food waste, fighting hunger, and building community.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#about" className="text-base text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-base text-gray-300 hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-base text-gray-300 hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#impact" className="text-base text-gray-300 hover:text-white">
                  Impact Reports
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Join Us
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/auth?tab=register&role=volunteer">
                  <a className="text-base text-gray-300 hover:text-white">
                    Volunteer
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/auth?tab=register&role=ngo">
                  <a className="text-base text-gray-300 hover:text-white">
                    Register NGO
                  </a>
                </Link>
              </li>
              <li>
                <a href="#donate" className="text-base text-gray-300 hover:text-white">
                  Donate Food
                </a>
              </li>
              <li>
                <a href="#partners" className="text-base text-gray-300 hover:text-white">
                  Partnerships
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Contact
            </h3>
            <p className="mt-4 text-base text-gray-300">
              1234 Food St, San Francisco, CA 94103<br />
              contact@foodshare.org<br />
              (555) 123-4567
            </p>
            <div className="flex space-x-6 mt-6">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-300">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-300">
              Cookies
            </a>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} FoodShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
