import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Network, Briefcase, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
    
    // Redirect to dashboard if user is logged in
    if (authStatus) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const features = [
    {
      title: "Revenue Dashboard",
      description: "Comprehensive view of all revenue metrics and KPIs",
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      path: "/dashboard"
    },
    {
      title: "Network vs Billing",
      description: "Reconcile network usage with billing records",
      icon: <Network className="h-10 w-10 text-primary" />,
      path: "/network-billing"
    },
    {
      title: "Mediation vs Billing",
      description: "Analyze mediation system data against billing",
      icon: <FileText className="h-10 w-10 text-primary" />,
      path: "/mediation-billing"
    },
    {
      title: "B2B Analysis",
      description: "Business customer revenue and performance metrics",
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      path: "/b2b-analysis"
    },
    {
      title: "B2C Analysis",
      description: "Consumer revenue and performance metrics",
      icon: <Users className="h-10 w-10 text-primary" />,
      path: "/b2c-analysis"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to RevenueFix</h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Comprehensive revenue analytics and billing reconciliation platform
              </p>
            </div>

            {!isAuthenticated && (
              <div className="mt-8 flex justify-center gap-4">
                <Button onClick={() => navigate("/login")} size="lg">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/signup")} variant="outline" size="lg">
                  Create Account
                </Button>
              </div>
            )}

            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-semibold">Key Features</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <Card key={feature.title} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="mb-4">{feature.icon}</div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(feature.path)}
                        disabled={!isAuthenticated}
                      >
                        {isAuthenticated ? "View" : "Sign in to view"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;