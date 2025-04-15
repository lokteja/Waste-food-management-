import StatsCard from "@/components/ui/stats-card";
import { Utensils, Users, Building2 } from "lucide-react";

interface StatsSectionProps {
  mealsSaved: number;
  activeVolunteers: number;
  partnerNGOs: number;
}

export default function StatsSection({
  mealsSaved,
  activeVolunteers,
  partnerNGOs,
}: StatsSectionProps) {
  return (
    <div className="bg-white py-12" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">
            Our Impact
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Making a difference together
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Join thousands of volunteers and organizations fighting food waste and hunger in communities nationwide.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Meals Saved"
              value={mealsSaved.toLocaleString()}
              color="primary"
              icon={<Utensils className="h-8 w-8 mx-auto text-primary-500" />}
            />

            <StatsCard
              title="Active Volunteers"
              value={activeVolunteers.toLocaleString()}
              color="secondary"
              icon={<Users className="h-8 w-8 mx-auto text-secondary-500" />}
            />

            <StatsCard
              title="Partner NGOs"
              value={partnerNGOs.toLocaleString()}
              color="accent"
              icon={<Building2 className="h-8 w-8 mx-auto text-accent-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
