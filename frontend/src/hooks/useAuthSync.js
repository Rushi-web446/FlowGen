import { useEffect, useState } from "react";

/**
 * useAuthSync - Verifies Auth0 authentication is ready
 * No longer calls backend endpoint (those require local JWT)
 */
export const useAuthSync = (isAuthenticated, getAccessTokenSilently) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(false);
      return;
    }

    let cancelled = false;

    const verifyAuth = async () => {
      try {
        // Just verify we can get an Auth0 token
        await getAccessTokenSilently();

        if (!cancelled) {
          setReady(true);
          console.log("✅ Auth0 verified");
        }
      } catch (err) {
        console.error("❌ Auth0 verification failed:", err);
        if (!cancelled) {
          setReady(false);
        }
      }
    };

    verifyAuth();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return ready;
};
