import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  UserSquare2,
  BookOpen,
  GraduationCap,
  FileText
} from "lucide-react";

interface SidebarProps {
  closeMenu?: () => void;
}

export default function Sidebar({ closeMenu }: SidebarProps) {
  const [location] = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Students', path: '/students', icon: UserSquare2 },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Grades', path: '/grades', icon: GraduationCap },
    { name: 'Reports', path: '/reports', icon: FileText }
  ];
  
  const handleItemClick = () => {
    if (closeMenu) {
      closeMenu();
    }
  };
  
  return (
    <aside className="bg-primary text-primary-foreground w-64 flex-shrink-0 h-full">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">Grade Management</h1>
        <nav>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link href={item.path} onClick={handleItemClick}>
                  <a
                    className={cn(
                      "flex items-center p-2 rounded hover:bg-white/10 transition-colors",
                      location === item.path && "bg-white/20"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
