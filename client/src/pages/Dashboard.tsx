import { 
  GraduationCap, 
  Book, 
  LineChart, 
  ClipboardCheck,
  UserPlus,
  PlusCircle,
  FileText,
  AlertTriangle,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/use-grades";
import DashboardCard from "@/components/DashboardCard";
import GradeChart from "@/components/GradeChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case "add_student":
        return (
          <div className="bg-primary/10 p-2 rounded-lg mr-3">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
        );
      case "update_grade":
        return (
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <LineChart className="h-4 w-4 text-blue-600" />
          </div>
        );
      case "complete_course":
        return (
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        );
      case "attendance_alert":
        return (
          <div className="bg-amber-100 p-2 rounded-lg mr-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="bg-primary/10 p-2 rounded-lg mr-3">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          trend={{
            value: "12% from last month",
            positive: true
          }}
          icon={<GraduationCap className="h-5 w-5" />}
          variant="primary"
        />
        
        <DashboardCard
          title="Active Courses"
          value={stats?.activeCourses || 0}
          trend={{
            value: "3 new this semester",
            positive: true
          }}
          icon={<Book className="h-5 w-5" />}
          variant="info"
        />
        
        <DashboardCard
          title="Avg. Grade"
          value={`${stats?.averageGrade || 0}%`}
          trend={{
            value: "2.3% from last term",
            positive: false
          }}
          icon={<LineChart className="h-5 w-5" />}
          variant="warning"
        />
        
        <DashboardCard
          title="Pending Grades"
          value={stats?.pendingGrades || 0}
          trend={{
            value: "12 due this week",
            warning: true
          }}
          icon={<ClipboardCheck className="h-5 w-5" />}
          variant="error"
        />
      </div>
      
      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && (
              <GradeChart 
                labels={stats.gradeDistribution.labels}
                data={stats.gradeDistribution.data}
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="link" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start">
                  {renderActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/students">
                <Button className="flex items-center" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </Link>
              <Link href="/courses">
                <Button className="flex items-center" variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Course
                </Button>
              </Link>
              <Button className="flex items-center" variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="text-sm flex justify-between">
                <span>Mid-term Grades Due</span>
                <span className="text-red-600 font-medium">2 days</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>Final Project Submission</span>
                <span className="text-amber-600 font-medium">1 week</span>
              </li>
              <li className="text-sm flex justify-between">
                <span>End of Semester</span>
                <span className="text-muted-foreground font-medium">3 weeks</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats?.topStudents.map((student, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">{student.name}</span>
                  </div>
                  <span className="text-sm font-medium">{student.averageGrade.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
