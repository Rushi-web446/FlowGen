import { useState, useEffect } from "react";
import api from "../api/axios";

/**
 * useLocalJWT - Exchanges Auth0 token for a local JWT token from backend
 * This token is used for all API calls to the backend
 * 
 * IMPORTANT: Must be called AFTER useAuthSync has verified Auth0
 * 
 * Flow:
 * 1. Try to login with Auth0 sub (for existing users)
 * 2. If login fails, try signup (for new users)
 * 3. Then use the returned JWT token for all API calls
 */
export const useLocalJWT = (isAuthenticated, user, getAccessTokenSilently, userReady = true) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only try to get JWT after:
    // 1. User is authenticated with Auth0
    // 2. Auth0 verification complete (userReady)
    // 3. User object is available with sub and name/email
    if (!isAuthenticated || !userReady || !user?.sub) {
      return;
    }

    let cancelled = false;

    const getLocalToken = async () => {
      try {
        setLoading(true);
        setError("");

        // First, try to login (user already exists)
        try {
          const loginResponse = await api.post("/auth/login", {
            sub: user.sub,
          });

          if (!cancelled && loginResponse.data?.data?.token) {
            const jwtToken = loginResponse.data.data.token;
            setToken(jwtToken);
            localStorage.setItem("localJWT", jwtToken);
            console.log("✅ Logged in with existing user");
            return;
          }
        } catch (loginErr) {
          // If login fails (user doesn't exist), try signup
          console.log("User not found, attempting signup...");

          const signupResponse = await api.post("/auth/signup", {
            sub: user.sub,
            name: user.name || "User",
            email: user.email || `${user.sub}@auth0.com`,
          });

          if (!cancelled) {
            // After signup, login to get JWT token
            const loginResponse = await api.post("/auth/login", {
              sub: user.sub,
            });

            if (loginResponse.data?.data?.token) {
              const jwtToken = loginResponse.data.data.token;
              setToken(jwtToken);
              localStorage.setItem("localJWT", jwtToken);
              console.log("✅ Signed up and logged in successfully");
            } else {
              throw new Error("Failed to get token after signup");
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Authentication failed:", err);
          const errorMsg = err.response?.data?.message || err.message || "Failed to authenticate";
          setError(errorMsg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getLocalToken();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.sub, user?.name, user?.email, userReady, getAccessTokenSilently]);

  return { token, loading, error };
};
