import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useUser } from "@/components/user-provider";

export function UserNameSetup() {
  const { userName, setUserName } = useUser();
  const [inputName, setInputName] = useState("");

  if (userName) {
    return null; // Don't show if name is already set
  }

  const handleSubmit = () => {
    if (inputName.trim()) {
      setUserName(inputName.trim());
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
            disabled={!inputName.trim()}
          >
            Begin Your Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}