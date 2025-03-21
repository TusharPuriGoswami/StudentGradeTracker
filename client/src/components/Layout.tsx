import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Search, Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get current page title based on location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/students":
        return "Students";
      case "/courses":
        return "Courses";
      case "/grades":
        return "Grades";
      case "/reports":
        return "Reports";
      default:
        return "Grade Management";
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar closeMenu={() => setIsMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-card shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden mr-3 text-muted-foreground"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-lg font-medium">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-60 pl-9"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="relative">
                <button className="text-muted-foreground hover:text-foreground">
                  <Bell size={20} />
                </button>
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary">
                  3
                </Badge>
              </div>
              <div className="relative">
                <button className="flex items-center text-muted-foreground hover:text-foreground">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="Avatar" />
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Admin User</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
