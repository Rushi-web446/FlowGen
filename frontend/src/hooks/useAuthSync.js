import { useEffect, useState } from "react";
import api from "../api/axios";

export const useAuthSync = (isAuthenticated, getAccessTokenSilently) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const syncUser = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: "https://text-to-learn-api",
          },
        });

        await api.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cancelled) setReady(true);
      } catch (err) {
        console.error("❌ Auth sync failed:", err);
      }
    };

    syncUser();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return ready;
};
