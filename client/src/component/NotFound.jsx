import { useEffect, useState } from "react";
import { ArrowLeft, Home, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/"; // Redirect to home using window.location
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`; // Redirect to search page
    }
  };

  const handleGoBack = () => {
    window.history.back(); // Go back using window.history
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30 dark:from-gray-900 dark:to-gray-800/30">
      <div className="max-w-md w-full mx-auto text-center space-y-8">
        {/* Error code with animation */}
        <div className="relative">
          <h1 className="text-9xl font-extrabold tracking-tighter text-primary dark:text-violet-500">
            404
          </h1>
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/10 dark:bg-violet-500/10 animate-pulse" />
          <div className="absolute -bottom-2 -left-4 w-16 h-16 rounded-full bg-primary/10 dark:bg-violet-500/10 animate-pulse delay-300" />
        </div>

        {/* Error message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold dark:text-gray-100">
            Page not found
          </h2>
          <p className="text-muted-foreground dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Illustration */}
        <div className="py-6 flex justify-center">
          <svg
            className="w-64 h-64"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M250 450C361.127 450 450 361.127 450 250C450 138.873 361.127 50 250 50C138.873 50 50 138.873 50 250C50 361.127 138.873 450 250 450Z"
              fill="#F8F9FA"
              stroke="#E4E7EC"
              strokeWidth="8"
              className="dark:fill-gray-800 dark:stroke-gray-700"
            />
            <path
              d="M250 400C333.797 400 400 333.797 400 250C400 166.203 333.797 100 250 100C166.203 100 100 166.203 100 250C100 333.797 166.203 400 250 400Z"
              fill="#F1F3F5"
              className="dark:fill-gray-700"
            />
            <path
              d="M180 200L320 340"
              stroke="#A3A3A3"
              strokeWidth="20"
              strokeLinecap="round"
              className="dark:stroke-gray-500"
            />
            <path
              d="M320 200L180 340"
              stroke="#A3A3A3"
              strokeWidth="20"
              strokeLinecap="round"
              className="dark:stroke-gray-500"
            />
          </svg>
        </div>

        {/* Navigation options */}
        <div className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="default" className="flex-1" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Home Page
              </a>
            </Button>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Search for content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
            <Button type="submit" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Auto-redirect notice */}
        <div className="text-sm text-muted-foreground dark:text-gray-400 flex items-center justify-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Redirecting to home in {countdown} seconds
        </div>
      </div>
    </div>
  );
}
