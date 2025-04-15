import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function VerificationPage() {
  const [_, params] = useLocation();
  const [location, setLocation] = useLocation();
  const { verifyAccountMutation } = useAuth();
  const { toast } = useToast();
  
  // Get the token from the URL query parameter
  const query = new URLSearchParams(window.location.search);
  const token = query.get('token');
  
  useEffect(() => {
    // If token exists, verify the account
    if (token) {
      verifyAccountMutation.mutate({ token });
    } else {
      toast({
        title: "Verification failed",
        description: "No verification token provided.",
        variant: "destructive",
      });
    }
  }, [token, verifyAccountMutation, toast]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {verifyAccountMutation.isPending ? (
              <>
                <Spinner className="mx-auto mb-4 h-12 w-12" />
                <CardTitle className="text-2xl font-bold mb-2">Verifying Your Account</CardTitle>
                <CardDescription className="text-neutral-600 mb-4">
                  Please wait while we verify your account...
                </CardDescription>
              </>
            ) : verifyAccountMutation.isSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">Account Verified Successfully</CardTitle>
                <CardDescription className="text-neutral-600 mb-6">
                  Your account has been successfully verified. You can now log in to access your dashboard.
                </CardDescription>
                <Button 
                  asChild
                  size="lg"
                >
                  <Link href="/auth">Go to Login</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">Verification Failed</CardTitle>
                <CardDescription className="text-neutral-600 mb-6">
                  {verifyAccountMutation.error?.message || 
                    "We couldn't verify your account. The link may have expired or is invalid."}
                </CardDescription>
                <div className="space-y-3">
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link href="/auth">Return to Login</Link>
                  </Button>
                  <Button 
                    asChild
                    variant="link"
                  >
                    <Link href="/">Go to Homepage</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
