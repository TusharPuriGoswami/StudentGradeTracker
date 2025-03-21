import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    } else if (!isLoading && isAuthenticated && roles && !roles.includes(user!.role)) {
      // If roles are specified and user doesn't have any of them
      setLocation('/dashboard');
    }
  }, [isAuthenticated, isLoading, roles, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    );
  }

  // Not authenticated users are redirected in useEffect
  if (!isAuthenticated) return null;

  // If roles are specified and user doesn't have any of them, they'll be redirected
  if (roles && user && !roles.includes(user.role)) return null;

  return <>{children}</>;
}