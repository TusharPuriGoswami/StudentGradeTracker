import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Student Grade Management
        </h1>
        <p className="text-gray-500 mt-2">Log in to access your dashboard</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            ← Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}