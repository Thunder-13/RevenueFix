import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Network, Briefcase, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCarousel } from "@/components/home/homePage";
import { motion } from "framer-motion";
import DashImage1 from "@/ImagesHome/DashImage1.jpg"
import DashImage2 from "@/ImagesHome/DashImage2.jpg"
import DashImage3 from "@/ImagesHome/DashImage3.jpg"
import DashImage4 from "@/ImagesHome/DashImage4.jpg"
import DashImage5 from "@/ImagesHome/DashImage5.jpg"
import DashImage6 from "@/ImagesHome/DashImage6.jpg"

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
    
    // Redirect to dashboard if user is logged in
  }, [navigate]);

  const features = [
    {
      title: "Revenue Dashboard",
      description: "Comprehensive view of all revenue metrics and KPIs",
      icon: <BarChart3 className="h-10 w-10 text-[#7e3af2]" />,
      path: "/dashboard"
    },
    {
      title: "CRM vs Billing",
      description: "Reconcile CRM usage with billing records",
      icon: <Network className="h-10 w-10 text-[#7e3af2]" />,
      path: "/crm-billing"
    },
    {
      title: "Network vs Billing",
      description: "Reconcile Voice, SMS, Data usage with billing records",
      icon: <FileText className="h-10 w-10 text-[#7e3af2]" />,
      path: "/network-billing-voice"
    },
    {
      title: "Customer Insights",
      description: "Customer segmentation and performance metrics",
      icon: <Briefcase className="h-10 w-10 text-[#7e3af2]" />,
      path: "/crm-insights"
    },
    {
      title: "Alarms & Cases Management",
      description: "Manage alarms and cases for better customer service",
      icon: <Users className="h-10 w-10 text-[#7e3af2]" />,
      path: "/alarm-management"
    }
  ];
  
  const carouselSlides = [
    {
      title: "Revenue Analytics Platform",
      description: "Gain insights into your telecom revenue streams with our comprehensive analytics platform",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      ctaText: "Explore Dashboard",
      ctaLink: "/login"
    },
    {
      title: "Billing Reconciliation",
      description: "Identify and resolve discrepancies between network usage and billing systems",
      image: DashImage2,
      ctaText: "Learn More",
      ctaLink: "/login"
    },
    {
      title: "Customer Insights",
      description: "Understand your customers better with advanced CRM analytics and segmentation",
      image: DashImage4,
      ctaText: "Get Started",
      ctaLink: "/login"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 mt-100px md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Hero Carousel */}
            <div className="mb-12">
              <HeroCarousel slides={carouselSlides} />
            </div>
            
            {/* Welcome Section */}
            <div className="mb-12 text-center">
                <motion.h1 
                className="text-4xl font-bold tracking-tight md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                Welcome to <span className="ml-10 flex items-center">
                  <img src={RevenueFix} alt="RevenueFix Logo" className="h-[50%] w-[50%] md:h-[50%] md:w-[50%]" />
                </span>
                </motion.h1>
              <motion.p 
                className="mt-4 text-xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                A Comprehensive revenue analytics and billing reconciliation platform
              </motion.p>
            </div>

            {!isAuthenticated && (
              <motion.div 
                className="mb-12 flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  onClick={() => navigate("/login")} 
                  size="lg"
                  className="bg-[#7e3af2] hover:bg-[#7e3af2]/90"
                >
                  Sign In
                </Button>
                <Button onClick={() => navigate("/signup")} variant="outline" size="lg">
                  Create Account
                </Button>
              </motion.div>
            )}

            {/* Key Features */}
            <div className="mb-16">
              <motion.h2 
                className="mb-8 text-center text-3xl font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Key Features
              </motion.h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                  >
                    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-[#7e3af2]/10">
                      <CardHeader>
                        <div className="mb-4 rounded-full bg-[#7e3af2]/10 p-3 w-fit">
                          {feature.icon}
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(feature.path)}
                          disabled={!isAuthenticated}
                          className="group w-full border-[#7e3af2]/30 text-[#7e3af2] hover:bg-[#7e3af2]/10"
                        >
                          {isAuthenticated ? (
                            <>
                              View 
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                          ) : (
                            "Sign in to view"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t bg-white py-8 dark:bg-[#1e1e2d] dark:border-gray-800">
          <div className="container mx-auto px-6">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h3 className="mb-4 text-lg font-semibold">RevenueFix</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive revenue analytics and billing reconciliation platform for telecom companies.
                </p>
              </div>
              
              <div>
                <h3 className="mb-4 text-lg font-semibold">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Case Studies</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Documentation</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="mb-4 text-lg font-semibold">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">About Us</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Careers</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Blog</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="mb-4 text-lg font-semibold">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Privacy Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Terms of Service</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-[#7e3af2]">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
              <p>Accenture &copy; {new Date().getFullYear()}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;