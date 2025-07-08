import { LifePathQuestionnaire } from "@/components/life-path-questionnaire";
import { useLocation } from "wouter";

export default function Questionnaire() {
  const [, setLocation] = useLocation();

  const handleQuestionnaireComplete = () => {
    // Redirect to home page after completion
    setLocation("/");
  };

  const handleQuestionnaireSkip = () => {
    // Redirect to home page if skipped
    setLocation("/");
  };

  return (
    <LifePathQuestionnaire
      onComplete={handleQuestionnaireComplete}
      onSkip={handleQuestionnaireSkip}
    />
  );
}