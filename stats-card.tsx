import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  color?: "primary" | "secondary" | "accent" | "default";
  icon?: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  color = "default",
  icon,
}: StatsCardProps) {
  const colorClasses = {
    primary: "border-primary-100 text-primary-500",
    secondary: "border-orange-100 text-secondary-500",
    accent: "border-blue-100 text-accent-500", 
    default: "border-gray-100 text-gray-500",
  };

  return (
    <div 
      className={cn(
        "stat-card bg-white overflow-hidden shadow rounded-lg border transition-all hover:shadow-xl transform hover:-translate-y-1",
        colorClasses[color]
      )}
    >
      <div className="px-4 py-5 sm:p-6 text-center">
        {icon && <div className="mb-3">{icon}</div>}
        <div className="text-5xl font-extrabold mb-3">{value}</div>
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</div>
      </div>
    </div>
  );
}
