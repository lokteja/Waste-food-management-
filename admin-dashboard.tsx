import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { NGO, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  LogOut, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  UserRound, 
  Building2, 
  BarChart4, 
  Shield, 
  UtilityPole,
  Package 
} from "lucide-react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import StatsCard from "@/components/ui/stats-card";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Fetch all NGOs
  const { data: ngos, isLoading: loadingNGOs } = useQuery<NGO[]>({
    queryKey: ["/api/ngos"],
    queryFn: async () => {
      const res = await fetch("/api/ngos");
      if (!res.ok) throw new Error("Failed to fetch NGOs");
      return res.json();
    },
  });

  // Fetch stats for dashboard
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Fetch all users
  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      // For development: mock response if endpoint not yet implemented
      if (res.status === 404) {
        return [];
      }
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Fetch all food pickups
  const { data: foodPickups, isLoading: loadingFoodPickups } = useQuery({
    queryKey: ["/api/food-pickups"],
    queryFn: async () => {
      const res = await fetch("/api/food-pickups");
      if (!res.ok) throw new Error("Failed to fetch food pickups");
      return res.json();
    },
  });

  // Approve NGO mutation
  const approveNGOMutation = useMutation({
    mutationFn: async (ngoId: number) => {
      const res = await apiRequest("POST", `/api/admin/approve-ngo/${ngoId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "NGO approved",
        description: "The NGO has been successfully approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ngos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve NGO",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproveNGO = (ngoId: number) => {
    approveNGOMutation.mutate(ngoId);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Ensure user is admin
  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 text-center mb-4">
          You do not have permission to access the admin dashboard.
        </p>
        <Button onClick={() => window.location.href = "/"}>
          Return to Home
        </Button>
      </div>
    );
  }

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
                    onClick={() => setActiveTab("ngos")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "ngos" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    NGOs
                  </button>
                  <button 
                    onClick={() => setActiveTab("users")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "users" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Users
                  </button>
                  <button 
                    onClick={() => setActiveTab("pickups")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === "pickups" 
                        ? "text-white bg-primary-700" 
                        : "text-primary-200 hover:text-white hover:bg-primary-700"
                    }`}
                  >
                    Food Pickups
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
                    <Shield className="h-4 w-4" />
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
              Admin Dashboard
            </h1>
          </div>
        </header>
        
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {activeTab === "dashboard" && (
                <div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard 
                      title="Total Meals Saved" 
                      value={stats?.totalMealsSaved?.toLocaleString() || "0"} 
                      color="primary"
                      icon={<UtilityPole className="h-8 w-8 mx-auto text-primary-500" />}
                    />
                    <StatsCard 
                      title="Active Volunteers" 
                      value={stats?.activeVolunteers?.toLocaleString() || "0"} 
                      color="secondary"
                      icon={<UserRound className="h-8 w-8 mx-auto text-secondary-500" />}
                    />
                    <StatsCard 
                      title="Partner NGOs" 
                      value={stats?.partnerNGOs?.toLocaleString() || "0"} 
                      color="accent"
                      icon={<Building2 className="h-8 w-8 mx-auto text-accent-500" />}
                    />
                    <StatsCard 
                      title="Active Pickups" 
                      value={foodPickups?.filter(p => p.status === 'pending' || p.status === 'assigned')?.length?.toString() || "0"} 
                      color="default"
                      icon={<Package className="h-8 w-8 mx-auto text-gray-500" />}
                    />
                  </div>
                  
                  {/* System Overview */}
                  <div className="mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>System Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center">
                              <UserRound className="h-6 w-6 text-primary-500 mr-3" />
                              <div>
                                <h3 className="font-medium">Volunteers</h3>
                                <p className="text-sm text-gray-500">
                                  {users?.filter(u => u.role === 'volunteer')?.length || 0} registered
                                </p>
                              </div>
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Active
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center">
                              <Building2 className="h-6 w-6 text-primary-500 mr-3" />
                              <div>
                                <h3 className="font-medium">NGOs</h3>
                                <p className="text-sm text-gray-500">
                                  {ngos?.length || 0} registered, {ngos?.filter(n => !n.isApproved)?.length || 0} pending approval
                                </p>
                              </div>
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Active
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center">
                              <Package className="h-6 w-6 text-primary-500 mr-3" />
                              <div>
                                <h3 className="font-medium">Food Pickup System</h3>
                                <p className="text-sm text-gray-500">
                                  {foodPickups?.length || 0} total pickups, {foodPickups?.filter(p => p.status === 'completed')?.length || 0} completed
                                </p>
                              </div>
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Operational
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Pending Approvals */}
                  <div className="mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pending NGO Approvals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingNGOs ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                          </div>
                        ) : ngos && ngos.filter(ngo => !ngo.isApproved).length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Organization Name</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead>Website</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {ngos.filter(ngo => !ngo.isApproved).map((ngo) => (
                                  <TableRow key={ngo.id}>
                                    <TableCell className="font-medium">{ngo.organizationName}</TableCell>
                                    <TableCell>{ngo.description || "No description"}</TableCell>
                                    <TableCell>
                                      {ngo.website ? (
                                        <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                          {ngo.website}
                                        </a>
                                      ) : (
                                        "N/A"
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button 
                                        onClick={() => handleApproveNGO(ngo.id)}
                                        disabled={approveNGOMutation.isPending}
                                        size="sm"
                                        className="flex items-center"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No pending approvals</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recent Activity */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingFoodPickups ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                          </div>
                        ) : foodPickups && foodPickups.length > 0 ? (
                          <div className="space-y-4">
                            {foodPickups.slice(0, 5).map((pickup) => (
                              <div key={pickup.id} className="flex items-center p-3 border-b border-gray-100">
                                <div className="flex-1">
                                  <p className="font-medium">{pickup.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {pickup.foodItems} ({pickup.quantity})
                                  </p>
                                </div>
                                <div>
                                  <Badge className={
                                    pickup.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                    pickup.status === 'assigned' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                                    pickup.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                    'bg-red-100 text-red-800 hover:bg-red-100'
                                  }>
                                    {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No activity to display</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              {activeTab === "ngos" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage NGOs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingNGOs ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                      ) : ngos && ngos.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Organization Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Website</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ngos.map((ngo) => (
                                <TableRow key={ngo.id}>
                                  <TableCell className="font-medium">{ngo.organizationName}</TableCell>
                                  <TableCell>{ngo.description || "No description"}</TableCell>
                                  <TableCell>
                                    {ngo.website ? (
                                      <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                        {ngo.website}
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={ngo.isApproved ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                                      {ngo.isApproved ? "Approved" : "Pending"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {!ngo.isApproved && (
                                      <Button 
                                        onClick={() => handleApproveNGO(ngo.id)}
                                        disabled={approveNGOMutation.isPending}
                                        size="sm"
                                        className="flex items-center"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <p className="text-gray-500">No NGOs registered in the system</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "users" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingUsers ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                      ) : users && users.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    <Badge className={
                                      user.role === 'volunteer' ? 'bg-primary-100 text-primary-800 hover:bg-primary-100' : 
                                      user.role === 'ngo' ? 'bg-secondary-100 text-secondary-800 hover:bg-secondary-100' : 
                                      'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                    }>
                                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={user.isVerified ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                                      {user.isVerified ? "Verified" : "Unverified"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <p className="text-gray-500">No users found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "pickups" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>All Food Pickups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingFoodPickups ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                      ) : foodPickups && foodPickups.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Tabs defaultValue="all">
                            <TabsList className="mb-4">
                              <TabsTrigger value="all">All</TabsTrigger>
                              <TabsTrigger value="pending">Pending</TabsTrigger>
                              <TabsTrigger value="assigned">Assigned</TabsTrigger>
                              <TabsTrigger value="completed">Completed</TabsTrigger>
                              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="all">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>NGO</TableHead>
                                    <TableHead>Food Items</TableHead>
                                    <TableHead>Pickup Time</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {foodPickups.map((pickup) => (
                                    <TableRow key={pickup.id}>
                                      <TableCell className="font-medium">{pickup.title}</TableCell>
                                      <TableCell>{pickup.ngoId}</TableCell>
                                      <TableCell>{pickup.foodItems} ({pickup.quantity})</TableCell>
                                      <TableCell>{new Date(pickup.pickupTime).toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Badge className={
                                          pickup.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                          pickup.status === 'assigned' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                                          pickup.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                          'bg-red-100 text-red-800 hover:bg-red-100'
                                        }>
                                          {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="pending">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>NGO</TableHead>
                                    <TableHead>Food Items</TableHead>
                                    <TableHead>Pickup Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {foodPickups.filter(p => p.status === 'pending').map((pickup) => (
                                    <TableRow key={pickup.id}>
                                      <TableCell className="font-medium">{pickup.title}</TableCell>
                                      <TableCell>{pickup.ngoId}</TableCell>
                                      <TableCell>{pickup.foodItems} ({pickup.quantity})</TableCell>
                                      <TableCell>{new Date(pickup.pickupTime).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="assigned">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>NGO</TableHead>
                                    <TableHead>Volunteer</TableHead>
                                    <TableHead>Pickup Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {foodPickups.filter(p => p.status === 'assigned').map((pickup) => (
                                    <TableRow key={pickup.id}>
                                      <TableCell className="font-medium">{pickup.title}</TableCell>
                                      <TableCell>{pickup.ngoId}</TableCell>
                                      <TableCell>{pickup.volunteerId}</TableCell>
                                      <TableCell>{new Date(pickup.pickupTime).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="completed">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>NGO</TableHead>
                                    <TableHead>Volunteer</TableHead>
                                    <TableHead>Pickup Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {foodPickups.filter(p => p.status === 'completed').map((pickup) => (
                                    <TableRow key={pickup.id}>
                                      <TableCell className="font-medium">{pickup.title}</TableCell>
                                      <TableCell>{pickup.ngoId}</TableCell>
                                      <TableCell>{pickup.volunteerId}</TableCell>
                                      <TableCell>{new Date(pickup.pickupTime).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="cancelled">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>NGO</TableHead>
                                    <TableHead>Food Items</TableHead>
                                    <TableHead>Pickup Time</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {foodPickups.filter(p => p.status === 'cancelled').map((pickup) => (
                                    <TableRow key={pickup.id}>
                                      <TableCell className="font-medium">{pickup.title}</TableCell>
                                      <TableCell>{pickup.ngoId}</TableCell>
                                      <TableCell>{pickup.foodItems} ({pickup.quantity})</TableCell>
                                      <TableCell>{new Date(pickup.pickupTime).toLocaleString()}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TabsContent>
                          </Tabs>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <p className="text-gray-500">No food pickups in the system</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
