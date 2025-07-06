import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState(() => {
    // Get from localStorage or default to empty string
    return localStorage.getItem("userName") || "";
  });

  useEffect(() => {
    // Save to localStorage whenever userName changes
    if (userName) {
      localStorage.setItem("userName", userName);
    }
  }, [userName]);

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