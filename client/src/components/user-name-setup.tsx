import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useUser } from "@/components/user-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function UserNameSetup() {
  const { userName, setUserName } = useUser();
  const [inputName, setInputName] = useState("");
  const queryClient = useQueryClient();

  const updateDisplayNameMutation = useMutation({
    mutationFn: async (displayName: string) => {
      const response = await apiRequest("/api/user/display-name", "POST", { displayName });
      return await response.json();
    },
    onSuccess: (data) => {
      setUserName(data.displayName);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      console.error("Failed to update display name:", error);
    }
  });

  if (userName) {
    return null; // Don't show if name is already set
  }

  const handleSubmit = () => {
    if (inputName.trim()) {
      updateDisplayNameMutation.mutate(inputName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-primary-foreground text-xl" />
          </div>
          <CardTitle className="text-2xl">Welcome to Your Journey</CardTitle>
          <p className="text-muted-foreground">
            What should we call you? This helps personalize your experience with Merlin, your AI guide.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-center"
            autoFocus
          />
          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!inputName.trim() || updateDisplayNameMutation.isPending}
          >
            {updateDisplayNameMutation.isPending ? "Setting up..." : "Begin Your Journey"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}