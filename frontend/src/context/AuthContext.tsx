import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth";
import { userApi } from "../api/user";

type User = {
  id: string;
  username: string;
  email: string;
  created_at?: string;
} | null;

interface AuthContextType {
  user: User;
  hasDetails: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  signup: (details: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [hasDetails, setHasDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authApi.getMe();
      if (data?.user) {
        setUser(data.user);
        try {
          const detailsData = await userApi.getDetails();
          setHasDetails(!!detailsData?.data);
        } catch (e) {
          setHasDetails(false);
        }
      } else {
        setUser(null);
        setHasDetails(false);
      }
    } catch (error) {
      setUser(null);
      setHasDetails(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: Record<string, string>) => {
    const data = await authApi.login(credentials);
    if (data?.user) {
      setUser(data.user);
      try {
        const detailsData = await userApi.getDetails();
        setHasDetails(!!detailsData?.data);
      } catch (e) {
        setHasDetails(false);
      }
    }
  };

  const signup = async (details: Record<string, string>) => {
    const data = await authApi.signup(details);
    if (data?.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setHasDetails(false);
  };

  const completeOnboarding = () => {
    setHasDetails(true);
  };

  return (
    <AuthContext.Provider value={{ user, hasDetails, isLoading, login, signup, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
