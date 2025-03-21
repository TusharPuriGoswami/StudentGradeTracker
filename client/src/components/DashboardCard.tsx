import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CardVariant = "primary" | "info" | "success" | "warning" | "error";

interface DashboardCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
    warning?: boolean;
  };
  icon: ReactNode;
  variant?: CardVariant;
}

export default function DashboardCard({
  title,
  value,
  trend,
  icon,
  variant = "primary"
}: DashboardCardProps) {
  const getVariantClass = (variant: CardVariant) => {
    switch (variant) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "info":
        return "bg-blue-100 text-blue-600";
      case "success":
        return "bg-green-100 text-green-600";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "error":
        return "bg-red-100 text-red-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-muted-foreground text-sm">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs flex items-center",
                  trend.warning
                    ? "text-amber-600"
                    : trend.positive
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {trend.positive ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : trend.warning ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 mr-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>{trend.value}</span>
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", getVariantClass(variant))}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
