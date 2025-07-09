import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/components/user-provider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { useAuth } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import UserProfile from "@/pages/user-profile";
import Pricing from "@/pages/pricing";
import Forum from "@/pages/forum";
import ForumCategory from "@/pages/forum-category";
import ForumPost from "@/pages/forum-post";
import ForumLeaderboard from "@/pages/forum-leaderboard";
import ForumAdmin from "@/pages/forum-admin";
import AdminPanel from "@/pages/admin-panel";
import EntryDetail from "@/pages/entry-detail";
import Entries from "@/pages/entries";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Questionnaire from "@/pages/questionnaire";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  useScrollToTop(); // This will scroll to top on route changes

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/entries" component={Entries} />
          <Route path="/entry/:id" component={EntryDetail} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/forum" component={Forum} />
          <Route path="/forum/category/:id" component={ForumCategory} />
          <Route path="/forum/post/:id" component={ForumPost} />
          <Route path="/forum/leaderboard" component={ForumLeaderboard} />
          <Route path="/forum/admin" component={ForumAdmin} />
          <Route path="/admin" component={AdminPanel} />
        </>
      )}
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/questionnaire" component={Questionnaire} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ScrollToTopButton />
            <PWAInstallPrompt />
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;