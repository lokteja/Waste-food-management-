import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User, FoodPickup } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Bell, AlertCircle } from "lucide-react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import StatsCard from "@/components/ui/stats-card";
import PickupRequestCard from "@/components/dashboard/pickup-request-card";
import ScheduledPickupList from "@/components/dashboard/scheduled-pickup-list";

export default function VolunteerDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch available pickup requests
  const { data: availablePickups, isLoading: loadingAvailable } = useQuery<FoodPickup[]>({
    queryKey: ["/api/food-pickups/available"],
    queryFn: async () => {
      const res = await fetch("/api/food-pickups/available");
      if (!res.ok) throw new Error("Failed to fetch available pickups");
      return res.json();
    },
  });

  // Fetch volunteer's scheduled pickups
  const { data: scheduledPickups, isLoading: loadingScheduled } = useQuery<FoodPickup[]>({
    queryKey: ["/api/food-pickups/volunteer"],
    queryFn: async () => {
      const res = await fetch("/api/food-pickups/volunteer");
      if (!res.ok) throw new Error("Failed to fetch scheduled pickups");
      return res.json();
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Calculate volunteer stats
  const completedPickups = scheduledPickups?.filter(p => p.status === 'completed') || [];
  const pendingPickups = scheduledPickups?.filter(p => p.status === 'assigned') || [];
  const mealsSaved = completedPickups.length * 25; // Assuming avg 25 meals per pickup
  const volunteerHours = completedPickups.length * 2; // Assuming avg 2 hours per pickup

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
                    onClick={() => setActiveTab("pickups")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "pickups" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Available Pickups
                  </button>
                  <button 
                    onClick={() => setActiveTab("scheduled")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "scheduled" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    My Pickups
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
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Volunteer Dashboard</h1>
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
                      title="Pickups Completed" 
                      value={completedPickups.length.toString()} 
                      color="primary"
                    />
                    <StatsCard 
                      title="Meals Saved" 
                      value={mealsSaved.toString()} 
                      color="secondary"
                    />
                    <StatsCard 
                      title="Volunteer Hours" 
                      value={volunteerHours.toString()} 
                      color="accent"
                    />
                  </div>
                  
                  {/* Upcoming Pickups Overview */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Your Upcoming Pickups</h2>
                    {loadingScheduled ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                      </div>
                    ) : pendingPickups && pendingPickups.length > 0 ? (
                      <ScheduledPickupList pickups={pendingPickups.slice(0, 3)} compact={true} />
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="flex justify-center mb-4">
                            <AlertCircle className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">No upcoming pickups</h3>
                          <p className="text-sm text-gray-500 mt-2">
                            You don't have any scheduled pickups. Check the "Available Pickups" tab to find opportunities.
                          </p>
                          <Button 
                            onClick={() => setActiveTab("pickups")} 
                            className="mt-4"
                          >
                            Find Pickups
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Recent Activity */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                    {completedPickups && completedPickups.length > 0 ? (
                      <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {completedPickups.slice(0, 5).map((pickup) => (
                            <li key={pickup.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-primary-600 truncate">
                                    {pickup.title}
                                  </p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Completed
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                      </svg>
                                      {pickup.address}, {pickup.city}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <p>
                                      {new Date(pickup.pickupTime).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-gray-500">No completed pickups yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === "pickups" && (
                <div>
                  <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Available Pickup Requests
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Browse and accept pickup requests from NGOs
                      </p>
                    </div>
                  </div>
                  
                  {loadingAvailable ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                    </div>
                  ) : availablePickups && availablePickups.length > 0 ? (
                    <div className="space-y-6">
                      {availablePickups.map((pickup) => (
                        <PickupRequestCard 
                          key={pickup.id} 
                          pickup={pickup} 
                          onAccept={() => {}} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No available pickups</h3>
                      <p className="mt-2 text-gray-500">
                        There are no pickup requests available at the moment. Please check back later.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "scheduled" && (
                <div>
                  <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Your Scheduled Pickups
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your accepted pickup requests
                      </p>
                    </div>
                  </div>
                  
                  {loadingScheduled ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                    </div>
                  ) : scheduledPickups && scheduledPickups.length > 0 ? (
                    <div>
                      <Tabs defaultValue="active">
                        <TabsList className="mb-4">
                          <TabsTrigger value="active">Active</TabsTrigger>
                          <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="active">
                          <ScheduledPickupList 
                            pickups={scheduledPickups.filter(p => p.status === 'assigned')} 
                          />
                        </TabsContent>
                        
                        <TabsContent value="completed">
                          <ScheduledPickupList 
                            pickups={scheduledPickups.filter(p => p.status === 'completed')} 
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No scheduled pickups</h3>
                      <p className="mt-2 text-gray-500">
                        You haven't accepted any pickup requests yet. Go to the "Available Pickups" tab to find opportunities.
                      </p>
                      <Button 
                        onClick={() => setActiveTab("pickups")} 
                        className="mt-4"
                      >
                        Find Pickups
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "profile" && (
                <div>
                  <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Your Profile
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        View and manage your account details
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 bg-primary-50">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Volunteer Information
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Personal details and contact information
                      </p>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Full name</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.firstName} {user.lastName}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Email address</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.email}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.phone}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Address</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.address}, {user.city}, {user.state} {user.zipCode}, {user.country}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Availability</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {user.availability ? user.availability.split(',').join(', ') : 'Not specified'}
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
