import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
  hasCompletedQuestionnaire: boolean;
  setHasCompletedQuestionnaire: (completed: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState(() => {
    // Get from localStorage or default to empty string
    return localStorage.getItem("userName") || "";
  });

  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);

  // Fetch current user data to get questionnaire completion status
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update questionnaire status from database when user data loads
  useEffect(() => {
    if (user && typeof user.hasCompletedQuestionnaire === 'boolean') {
      setHasCompletedQuestionnaire(user.hasCompletedQuestionnaire);
    }
  }, [user]);

  useEffect(() => {
    // Save to localStorage whenever userName changes
    if (userName) {
      localStorage.setItem("userName", userName);
    }
  }, [userName]);

  const value = {
    userName,
    setUserName,
    hasCompletedQuestionnaire,
    setHasCompletedQuestionnaire,
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