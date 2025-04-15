import { Star } from "lucide-react";

export default function Testimonials() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Hear from our community
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <Star className="h-8 w-8 text-yellow-400" fill="currentColor" />
                <p className="mt-4 text-base text-gray-500 italic">
                  "FoodShare has been a game-changer for our shelter. We now receive regular food donations that help us serve more people in need."
                </p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-primary-100 text-primary-800 flex items-center justify-center font-bold">
                      SJ
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Hope Shelter Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <Star className="h-8 w-8 text-yellow-400" fill="currentColor" />
                <p className="mt-4 text-base text-gray-500 italic">
                  "As a restaurant owner, I hated throwing away good food. With FoodShare, I can ensure it goes to people who need it while reducing waste."
                </p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-secondary-100 text-secondary-800 flex items-center justify-center font-bold">
                      MT
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Michael Tan</p>
                    <p className="text-sm text-gray-500">Restaurant Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
            <div className="flex-1 bg-white p-6 flex flex-col justify-between">
              <div className="flex-1">
                <Star className="h-8 w-8 text-yellow-400" fill="currentColor" />
                <p className="mt-4 text-base text-gray-500 italic">
                  "Volunteering with FoodShare has been incredibly rewarding. I get to help reduce waste and feed people in my community every week."
                </p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-accent-100 text-accent-800 flex items-center justify-center font-bold">
                      JL
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Jessica Lee</p>
                    <p className="text-sm text-gray-500">Volunteer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
