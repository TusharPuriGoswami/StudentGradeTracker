import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import ProfileForm from "@/components/ProfileForm";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive"
      });
      setLocation("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [setLocation, toast]);

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <Layout>
      <ProfileForm />
    </Layout>
  );
}