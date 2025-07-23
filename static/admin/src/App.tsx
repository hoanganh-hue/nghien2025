import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./shared/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./shared/components/ui/toaster";
import { TooltipProvider } from "./shared/components/ui/tooltip";
import { AuthService } from "./shared/lib/auth";
import Login from "./legacy/App_1753124400862";
import Dashboard from "./domains/user/dashboard";
import Registrations from "./domains/registration/registrations";
import Verifications from "./domains/verification/verifications";
import Transactions from "./domains/transactions/transactions";
import Settings from "./domains/user/settings";
import NotFound from "./shared/not-found";
import Sidebar from "./shared/components/layout/sidebar";
import Header from "./shared/components/layout/header";
import { useState, useEffect } from "react";
import { User } from "./shared/types";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const isAuthenticated = AuthService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isAuthenticated = AuthService.isAuthenticated();

  // Redirect to dashboard if logged in and on login page
  if (location === "/login" && isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  // Redirect to login if not authenticated and not on login page
  if (location !== "/login" && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard">
        <AuthLayout>
          <ProtectedRoute component={Dashboard} />
        </AuthLayout>
      </Route>
      
      <Route path="/registrations">
        <AuthLayout>
          <ProtectedRoute component={Registrations} />
        </AuthLayout>
      </Route>
      
      <Route path="/verifications">
        <AuthLayout>
          <ProtectedRoute component={Verifications} />
        </AuthLayout>
      </Route>
      
      <Route path="/transactions">
        <AuthLayout>
          <ProtectedRoute component={Transactions} />
        </AuthLayout>
      </Route>
      
      <Route path="/settings">
        <AuthLayout>
          <ProtectedRoute component={Settings} />
        </AuthLayout>
      </Route>

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
