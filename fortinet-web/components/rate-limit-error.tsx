import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface RateLimitErrorProps {
  onRetry: () => void;
  message?: string;
}

export function RateLimitError({ onRetry, message }: RateLimitErrorProps) {
  const [countdown, setCountdown] = useState(30);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanRetry(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setCountdown(30);
    setCanRetry(false);
    onRetry();
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md border-amber-200 bg-amber-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-amber-800">Rate Limit Exceeded</CardTitle>
          <CardDescription className="text-amber-700">
            You're making requests too quickly. Please slow down to ensure optimal performance for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-amber-700 mb-2">
              {message || "Please wait before making another request."}
            </p>
            {!canRetry && (
              <p className="text-lg font-semibold text-amber-800">
                Retry in <span className="text-amber-600">{countdown}</span> seconds
              </p>
            )}
          </div>

          <Button
            onClick={handleRetry}
            disabled={!canRetry}
            className={`w-full ${
              canRetry
                ? "bg-green-600 hover:bg-green-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {canRetry ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Now
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Retry in {countdown}s
              </>
            )}
          </Button>

          <div className="bg-amber-100 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Tips to avoid rate limits:
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Wait for pages to fully load before navigating</li>
                  <li>• Avoid rapid clicking or refreshing</li>
                  <li>• Use filters to reduce unnecessary requests</li>
                  <li>• Consider bookmarking frequently used pages</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}