import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodPickup } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface ScheduledPickupListProps {
  pickups: FoodPickup[];
  compact?: boolean;
}

export default function ScheduledPickupList({ 
  pickups,
  compact = false 
}: ScheduledPickupListProps) {
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/food-pickups/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Pickup status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/food-pickups/volunteer"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleComplete = (id: number) => {
    updateStatusMutation.mutate({ id, status: "completed" });
  };

  const handleCancel = (id: number) => {
    updateStatusMutation.mutate({ id, status: "cancelled" });
  };

  if (pickups.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No pickups found</h3>
        <p className="mt-2 text-gray-500">
          {compact 
            ? "You don't have any scheduled pickups yet." 
            : "There are no scheduled pickups matching this criteria."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {pickups.map((pickup) => {
          const pickupDate = new Date(pickup.pickupTime);
          const isToday = new Date().toDateString() === pickupDate.toDateString();
          const isFuture = pickupDate > new Date();
          
          return (
            <li key={pickup.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 truncate">{pickup.title}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isToday 
                          ? "bg-green-100 text-green-800" 
                          : isFuture 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-gray-100 text-gray-800"
                      }`}>
                        {isToday ? "Today" : format(pickupDate, "MMM d")}
                      </p>
                    </div>
                  </div>
                  {!compact && (
                    <div className="ml-2 flex-shrink-0 flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleComplete(pickup.id)}
                        disabled={updateStatusMutation.isPending}
                        className="mr-2 text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span className="ml-1">Complete</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCancel(pickup.id)}
                        disabled={updateStatusMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="h-5 w-5" />
                        <span className="ml-1">Cancel</span>
                      </Button>
                    </div>
                  )}
                  {compact && (
                    <div className="ml-2 flex-shrink-0 flex items-center">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {pickup.address}, {pickup.city}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>
                      {format(new Date(pickup.pickupTime), "p")} - {format(new Date(pickup.pickupEndTime), "p")}
                    </p>
                  </div>
                </div>
                {!compact && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Food items:</span> {pickup.foodItems} ({pickup.quantity})
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Destination:</span> {pickup.destination}
                    </p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
