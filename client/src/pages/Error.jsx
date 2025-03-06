import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(15);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/"); // Redirect to home using React Router DOM
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full mx-auto text-center space-y-8">
        {/* Error icon with animation */}
        <div className="relative flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-red-50 animate-pulse" />
          <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-red-50 animate-pulse delay-300" />
        </div>

        {/* Error message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            We're sorry, but we encountered an unexpected error.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Navigation options */}
        <div className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => reset()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)} // Go back using React Router DOM
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <Button variant="ghost" className="w-full" asChild>
            <a href="/">
              {" "}
              {/* Use a standard anchor tag or React Router's Link */}
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </a>
          </Button>
        </div>

        {/* Auto-redirect notice */}
        <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Redirecting to home in {countdown} seconds
        </div>
      </div>
    </div>
  );
}
