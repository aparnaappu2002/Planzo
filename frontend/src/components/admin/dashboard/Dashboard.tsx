import { BarChart3, Users, Store, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,345",
      change: "+12%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Vendors",
      value: "156",
      change: "+8%",
      icon: Store,
      trend: "up"
    },
    {
      title: "Revenue",
      value: "$45,231",
      change: "+23%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Orders",
      value: "1,234",
      change: "+5%",
      icon: BarChart3,
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-medium">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Vendor application approved</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-accent hover:bg-accent/80 rounded-lg transition-colors">
                <div className="font-medium">Add New User</div>
                <div className="text-sm text-muted-foreground">Create a new user account</div>
              </button>
              <button className="w-full p-3 text-left bg-accent hover:bg-accent/80 rounded-lg transition-colors">
                <div className="font-medium">Review Vendor Applications</div>
                <div className="text-sm text-muted-foreground">3 pending applications</div>
              </button>
              <button className="w-full p-3 text-left bg-accent hover:bg-accent/80 rounded-lg transition-colors">
                <div className="font-medium">Generate Reports</div>
                <div className="text-sm text-muted-foreground">Export monthly analytics</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}