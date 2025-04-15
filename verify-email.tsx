import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

export default function VerifyEmailPage() {
  const { verifyEmailMutation } = useAuth();
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmailMutation.mutate(tokenParam);
    }
  }, [verifyEmailMutation]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden py-12 px-6 text-center">
            {verifyEmailMutation.isPending ? (
              <>
                <div className="rounded-full bg-blue-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verifying your email...</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            ) : verifyEmailMutation.isError ? (
              <>
                <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Failed</h2>
                <p className="mt-2 text-sm text-gray-600">
                  {verifyEmailMutation.error.message || "The verification link is invalid or has expired."}
                </p>
                <div className="mt-8">
                  <Button onClick={() => navigate("/auth")} variant="outline" className="mx-2">
                    Back to Login
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verified Successfully!</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your email has been verified and your account is now active. You can now log in to your account.
                </p>
                <div className="mt-8">
                  <Button onClick={() => navigate("/auth")} className="mx-auto">
                    Login to your account
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
