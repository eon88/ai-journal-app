import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("");

  // Fetch current user data to get display name
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user data from database when user data loads
  useEffect(() => {
    if (user && typeof user === 'object') {
      const userData = user as any;
      if (userData.displayName) {
        setUserName(userData.displayName);
      } else if (userData.username) {
        // Set a default display name from username if no display name is set
        setUserName(userData.username || "");
      }
    }
  }, [user]);

  const value = {
    userName,
    setUserName,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};