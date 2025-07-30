import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { BarChart3, Calendar, DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives/Card";

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  // Mock data for demonstration
  const stats = {
    totalRevenue: 15234,
    totalBookings: 87,
    activeClients: 34,
    avgRating: 4.8,
    monthlyGrowth: 12.5,
    upcomingBookings: 5,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 mt-1">Welcome back, {user?.firstName || 'there'}!</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-[#00FFAD]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">
                <span className="text-[#00FFAD]">+{stats.monthlyGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-[#00FFAD]/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalBookings}</div>
              <p className="text-xs text-gray-400 mt-1">
                <span className="text-[#00FFAD]">{stats.upcomingBookings}</span> upcoming
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-[#00FFAD]/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeClients}</div>
              <p className="text-xs text-gray-400 mt-1">Unique clients this month</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#00FFAD]/40" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
              <p className="text-xs text-gray-400 mt-1">Based on recent reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#00FFAD]" />
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Client {i + 1}</p>
                      <p className="text-sm text-gray-400">Service Type • Tomorrow at {10 + i}:00 AM</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${75 + i * 25}</p>
                      <p className="text-sm text-[#00FFAD]">Confirmed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full p-3 text-left bg-gray-800/50 rounded-lg hover:bg-[#00FFAD]/10 hover:border-[#00FFAD]/20 border border-transparent transition-all text-gray-300 hover:text-[#00FFAD]">
                  View Calendar
                </button>
                <button className="w-full p-3 text-left bg-gray-800/50 rounded-lg hover:bg-[#00FFAD]/10 hover:border-[#00FFAD]/20 border border-transparent transition-all text-gray-300 hover:text-[#00FFAD]">
                  Manage Services
                </button>
                <button className="w-full p-3 text-left bg-gray-800/50 rounded-lg hover:bg-[#00FFAD]/10 hover:border-[#00FFAD]/20 border border-transparent transition-all text-gray-300 hover:text-[#00FFAD]">
                  View Analytics
                </button>
                <button className="w-full p-3 text-left bg-gray-800/50 rounded-lg hover:bg-[#00FFAD]/10 hover:border-[#00FFAD]/20 border border-transparent transition-all text-gray-300 hover:text-[#00FFAD]">
                  Message Clients
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card variant="glass" className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#00FFAD]" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Revenue chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}