import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodPickup } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Navigation2, ClipboardList, Building } from "lucide-react";
import { format } from "date-fns";

interface PickupRequestCardProps {
  pickup: FoodPickup;
  onAccept?: () => void;
}

export default function PickupRequestCard({ pickup, onAccept }: PickupRequestCardProps) {
  const { toast } = useToast();

  const acceptPickupMutation = useMutation({
    mutationFn: async (pickupId: number) => {
      const res = await apiRequest("POST", `/api/food-pickups/${pickupId}/assign`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pickup assigned",
        description: "You have successfully accepted this pickup request.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/food-pickups/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-pickups/volunteer"] });
      if (onAccept) onAccept();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept pickup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    acceptPickupMutation.mutate(pickup.id);
  };

  return (
    <Card className="shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {pickup.title}
            </h3>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <p className="text-sm text-gray-500">
                {pickup.address}, {pickup.city}, {pickup.state}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`
              px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${pickup.distance && parseFloat(pickup.distance) < 3 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"}
            `}>
              {pickup.distance ? `${pickup.distance} miles away` : "Distance N/A"}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Food Items
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {pickup.foodItems} ({pickup.quantity})
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pickup Time
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {format(new Date(pickup.pickupTime), "PPP, p")} - {format(new Date(pickup.pickupEndTime), "p")}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Destination
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {pickup.destination}
            </dd>
          </div>
          {pickup.additionalNotes && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Additional Notes
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickup.additionalNotes}
              </dd>
            </div>
          )}
        </dl>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
        <Button 
          onClick={handleAccept}
          disabled={acceptPickupMutation.isPending}
          className="inline-flex items-center"
        >
          {acceptPickupMutation.isPending ? "Processing..." : "Accept Pickup"}
          {!acceptPickupMutation.isPending && <Navigation2 className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </Card>
  );
}
