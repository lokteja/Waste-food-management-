import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  allowedRoles?: string[];
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : allowedRoles && !allowedRoles.includes(user.role) ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-center mb-4">
            You do not have permission to access this page.
          </p>
          <a href="/" className="text-primary-600 hover:underline">
            Return to Home
          </a>
        </div>
      ) : (
        <Component />
      )}
    </Route>
  );
}
