import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-md w-full mx-auto text-center space-y-8">
            {/* Error icon with animation */}
            <div className="relative flex justify-center">
              <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            {/* Error message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Critical Error</h2>
              <p className="text-muted-foreground">
                We're sorry, but a critical error has occurred in the
                application.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Action button */}
            <div>
              <Button
                variant="default"
                onClick={() => reset()}
                className="px-8"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
