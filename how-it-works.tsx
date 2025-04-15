import { UserRound, CalendarClock, Truck } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="bg-gray-50 py-16" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            Process
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How FoodShare Works
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-3 text-lg font-medium text-gray-900">
              Simple 3-step process
            </span>
          </div>
        </div>

        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl">
            <div className="flex-shrink-0 bg-primary-500 h-2"></div>
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex justify-center">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-500 mb-4">
                    <UserRound className="h-6 w-6" />
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900 mb-2">Sign Up</p>
                  <p className="text-base text-gray-500">
                    Register as a volunteer or an NGO to get started with our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl">
            <div className="flex-shrink-0 bg-secondary-500 h-2"></div>
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex justify-center">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-orange-100 text-secondary-500 mb-4">
                    <CalendarClock className="h-6 w-6" />
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900 mb-2">Connect</p>
                  <p className="text-base text-gray-500">
                    NGOs post food availability, volunteers select pickup opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl">
            <div className="flex-shrink-0 bg-accent-500 h-2"></div>
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex justify-center">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-accent-500 mb-4">
                    <Truck className="h-6 w-6" />
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900 mb-2">Distribute</p>
                  <p className="text-base text-gray-500">
                    Volunteers pick up and deliver food to NGOs who distribute to those in need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
