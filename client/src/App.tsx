import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import WritingPage from "@/pages/writing-page";
import CreateWritingPage from "@/pages/create-writing-page";
import ExplorePage from "@/pages/explore-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/explore" component={ExplorePage} />
      <ProtectedRoute path="/create" component={CreateWritingPage} />
      <Route path="/profile/:id" component={ProfilePage} />
      <Route path="/writing/:id" component={WritingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
