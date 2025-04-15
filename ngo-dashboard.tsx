import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { FoodPickup, NGO, insertFoodPickupSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LogOut, Bell, AlertCircle, Plus, Calendar, Package, History } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import StatsCard from "@/components/ui/stats-card";

export default function NGODashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Fetch NGO info
  const { data: ngoInfo, isLoading: loadingNGO } = useQuery<NGO>({
    queryKey: ["/api/ngos/user"],
    queryFn: async () => {
      const res = await fetch(`/api/ngos/user/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch NGO information");
      return res.json();
    },
  });

  // Fetch NGO's food pickups
  const { data: ngoPickups, isLoading: loadingPickups } = useQuery<FoodPickup[]>({
    queryKey: ["/api/food-pickups/ngo", ngoInfo?.id],
    queryFn: async () => {
      if (!ngoInfo?.id) return [];
      const res = await fetch(`/api/food-pickups/ngo/${ngoInfo.id}`);
      if (!res.ok) throw new Error("Failed to fetch NGO pickups");
      return res.json();
    },
    enabled: !!ngoInfo?.id,
  });

  // Create food pickup form
  const foodPickupForm = useForm<z.infer<typeof insertFoodPickupSchema>>({
    resolver: zodResolver(insertFoodPickupSchema),
    defaultValues: {
      ngoId: ngoInfo?.id || 0,
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      foodItems: "",
      quantity: "",
      pickupTime: new Date().toISOString(),
      pickupEndTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      destination: "",
      additionalNotes: "",
    },
  });

  // Update form values when NGO info loads
  if (ngoInfo?.id && foodPickupForm.getValues("ngoId") === 0) {
    foodPickupForm.setValue("ngoId", ngoInfo.id);
  }

  const createPickupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertFoodPickupSchema>) => {
      const res = await apiRequest("POST", "/api/food-pickups", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pickup created",
        description: "Your food pickup request has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/food-pickups/ngo", ngoInfo?.id] });
      foodPickupForm.reset();
      setActiveTab("pickups");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create pickup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitPickup = (values: z.infer<typeof insertFoodPickupSchema>) => {
    createPickupMutation.mutate(values);
  };

  if (!user || loadingNGO) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Calculate NGO stats
  const pendingPickups = ngoPickups?.filter(p => p.status === 'pending') || [];
  const assignedPickups = ngoPickups?.filter(p => p.status === 'assigned') || [];
  const completedPickups = ngoPickups?.filter(p => p.status === 'completed') || [];
  const totalMealsSaved = completedPickups.length * 25; // Assuming avg 25 meals per pickup

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-primary-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-white">FoodShare</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "dashboard" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setActiveTab("create")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "create" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Create Pickup
                  </button>
                  <button 
                    onClick={() => setActiveTab("pickups")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "pickups" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Manage Pickups
                  </button>
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "profile" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button className="p-1 rounded-full text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-800 focus:ring-white mr-3">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 relative flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-bold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <span className="ml-2 text-sm text-white hidden md:block">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logoutMutation.mutate()}
                  className="text-primary-200 hover:text-white"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10 flex-grow">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              {!ngoInfo?.isApproved && (
                <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm mr-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Pending Approval
                </div>
              )}
              NGO Dashboard
            </h1>
            {!ngoInfo?.isApproved && (
              <p className="mt-2 text-sm text-gray-500">
                Your NGO account is pending approval by an administrator. Some features may be limited until approval.
              </p>
            )}
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {activeTab === "dashboard" && (
                <div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <StatsCard 
                      title="Active Pickups" 
                      value={(pendingPickups.length + assignedPickups.length).toString()} 
                      color="primary"
                      icon={<Package className="h-8 w-8 mx-auto text-primary-500" />}
                    />
                    <StatsCard 
                      title="Meals Saved" 
                      value={totalMealsSaved.toString()} 
                      color="secondary"
                      icon={<Package className="h-8 w-8 mx-auto text-secondary-500" />}
                    />
                    <StatsCard 
                      title="Completed Pickups" 
                      value={completedPickups.length.toString()} 
                      color="accent"
                      icon={<History className="h-8 w-8 mx-auto text-accent-500" />}
                    />
                  </div>
                  
                  {/* NGO Info */}
                  <div className="mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingNGO ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                          </div>
                        ) : ngoInfo ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-medium">{ngoInfo.organizationName}</h3>
                              <p className="text-sm text-gray-500">{ngoInfo.description || "No description provided"}</p>
                            </div>
                            {ngoInfo.website && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Website</h4>
                                <p className="text-sm text-primary-600">
                                  <a href={ngoInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {ngoInfo.website}
                                  </a>
                                </p>
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Status</h4>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                ngoInfo.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {ngoInfo.isApproved ? "Approved" : "Pending Approval"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No information available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Pickups */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Pickup Requests</h2>
                    {loadingPickups ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                      </div>
                    ) : ngoPickups && ngoPickups.length > 0 ? (
                      <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {ngoPickups.slice(0, 5).map((pickup) => (
                            <li key={pickup.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-primary-600 truncate">
                                    {pickup.title}
                                  </p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                      ${pickup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        pickup.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                                        pickup.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                        'bg-red-100 text-red-800'}`}
                                    >
                                      {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                      {new Date(pickup.pickupTime).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {pickup.volunteerId && (
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                      <p className="bg-primary-50 px-2 py-1 rounded text-primary-600">
                                        Volunteer assigned
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="flex justify-center mb-4">
                            <AlertCircle className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">No pickup requests</h3>
                          <p className="text-sm text-gray-500 mt-2">
                            You haven't created any pickup requests yet.
                          </p>
                          <Button 
                            onClick={() => setActiveTab("create")} 
                            className="mt-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Pickup Request
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === "create" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Food Pickup Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...foodPickupForm}>
                        <form onSubmit={foodPickupForm.handleSubmit(onSubmitPickup)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={foodPickupForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pickup Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Fresh Bakery Items" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={foodPickupForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Briefly describe the food pickup" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={foodPickupForm.control}
                              name="foodItems"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Food Items</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bread, pastries, cakes" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={foodPickupForm.control}
                              name="quantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 20 loaves, 5kg, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={foodPickupForm.control}
                              name="pickupTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pickup Start Time</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="datetime-local" 
                                      {...field} 
                                      value={new Date(field.value).toISOString().slice(0, 16)}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={foodPickupForm.control}
                              name="pickupEndTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pickup End Time</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="datetime-local" 
                                      {...field} 
                                      value={new Date(field.value).toISOString().slice(0, 16)}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={foodPickupForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pickup Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="123 Main St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                              control={foodPickupForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="San Francisco" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={foodPickupForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={foodPickupForm.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="94103" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={foodPickupForm.control}
                            name="destination"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Destination</FormLabel>
                                <FormControl>
                                  <Input placeholder="Name of the facility where food will be delivered" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={foodPickupForm.control}
                            name="additionalNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Any special instructions for volunteers (e.g., 'Use back entrance', 'Ask for manager John')" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="pt-5 flex justify-end">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => foodPickupForm.reset()} 
                              className="mr-3"
                              disabled={createPickupMutation.isPending}
                            >
                              Reset
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={createPickupMutation.isPending || !ngoInfo?.isApproved}
                            >
                              {createPickupMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                "Create Pickup Request"
                              )}
                            </Button>
                          </div>
                          
                          {!ngoInfo?.isApproved && (
                            <div className="pt-2 text-center text-yellow-600 text-sm">
                              <AlertCircle className="inline-block mr-1 h-4 w-4" />
                              Your NGO needs to be approved before you can create pickup requests
                            </div>
                          )}
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "pickups" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Manage Pickup Requests</h2>
                  
                  {loadingPickups ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                    </div>
                  ) : ngoPickups && ngoPickups.length > 0 ? (
                    <Tabs defaultValue="active">
                      <TabsList className="mb-4">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="assigned">Assigned</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="active">
                        <div className="space-y-6">
                          {pendingPickups.length > 0 ? (
                            pendingPickups.map((pickup) => (
                              <Card key={pickup.id}>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{pickup.title}</h3>
                                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                      Pending
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p><span className="font-medium">Food Items:</span> {pickup.foodItems} ({pickup.quantity})</p>
                                    <p><span className="font-medium">Pickup Time:</span> {new Date(pickup.pickupTime).toLocaleString()} - {new Date(pickup.pickupEndTime).toLocaleTimeString()}</p>
                                    <p><span className="font-medium">Location:</span> {pickup.address}, {pickup.city}, {pickup.state} {pickup.zipCode}</p>
                                    <p><span className="font-medium">Destination:</span> {pickup.destination}</p>
                                    {pickup.additionalNotes && <p><span className="font-medium">Notes:</span> {pickup.additionalNotes}</p>}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-10">
                              <p className="text-gray-500">No pending pickup requests</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="assigned">
                        <div className="space-y-6">
                          {assignedPickups.length > 0 ? (
                            assignedPickups.map((pickup) => (
                              <Card key={pickup.id}>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{pickup.title}</h3>
                                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                      Assigned to Volunteer
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p><span className="font-medium">Food Items:</span> {pickup.foodItems} ({pickup.quantity})</p>
                                    <p><span className="font-medium">Pickup Time:</span> {new Date(pickup.pickupTime).toLocaleString()} - {new Date(pickup.pickupEndTime).toLocaleTimeString()}</p>
                                    <p><span className="font-medium">Location:</span> {pickup.address}, {pickup.city}, {pickup.state} {pickup.zipCode}</p>
                                    <p><span className="font-medium">Destination:</span> {pickup.destination}</p>
                                    {pickup.additionalNotes && <p><span className="font-medium">Notes:</span> {pickup.additionalNotes}</p>}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-10">
                              <p className="text-gray-500">No assigned pickup requests</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="completed">
                        <div className="space-y-6">
                          {completedPickups.length > 0 ? (
                            completedPickups.map((pickup) => (
                              <Card key={pickup.id}>
                                <CardContent className="p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">{pickup.title}</h3>
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                      Completed
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p><span className="font-medium">Food Items:</span> {pickup.foodItems} ({pickup.quantity})</p>
                                    <p><span className="font-medium">Pickup Time:</span> {new Date(pickup.pickupTime).toLocaleString()}</p>
                                    <p><span className="font-medium">Location:</span> {pickup.address}, {pickup.city}, {pickup.state} {pickup.zipCode}</p>
                                    <p><span className="font-medium">Destination:</span> {pickup.destination}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-10">
                              <p className="text-gray-500">No completed pickup requests</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <AlertCircle className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium">No pickup requests</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          You haven't created any pickup requests yet.
                        </p>
                        <Button 
                          onClick={() => setActiveTab("create")} 
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Pickup Request
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              
              {activeTab === "profile" && (
                <div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 bg-primary-50">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        NGO Profile
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Organization and contact information
                      </p>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Organization name</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {ngoInfo?.organizationName || "N/A"}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {ngoInfo?.description || "No description provided"}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Website</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {ngoInfo?.website ? (
                              <a href={ngoInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                {ngoInfo.website}
                              </a>
                            ) : (
                              "No website provided"
                            )}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Contact name</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.firstName} {user.lastName}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Email address</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.email}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.phone}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Address</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.address}, {user.city}, {user.state} {user.zipCode}, {user.country}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Approval status</dt>
                          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ngoInfo?.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {ngoInfo?.isApproved ? "Approved" : "Pending Approval"}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
