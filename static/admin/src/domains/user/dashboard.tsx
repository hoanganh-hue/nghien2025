import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/shared/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Users,
  Shield,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatNumber, formatRelativeTime } from "@/shared/lib/utils";
import { DashboardStats, AuditLog } from "@/shared/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => AuthService.apiRequest("/dashboard/stats"),
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<AuditLog[]>({
    queryKey: ["recent-activities"],
    queryFn: () => AuthService.apiRequest("/dashboard/recent-activities"),
  });

  if (statsLoading || activitiesLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Tổng đăng ký",
      value: stats?.total_registrations || 0,
      subtitle: `${stats?.pending_registrations || 0} chờ duyệt`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Xác minh tài khoản",
      value: stats?.total_verifications || 0,
      subtitle: `${stats?.pending_verifications || 0} chờ xử lý`,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Giao dịch",
      value: stats?.total_transactions || 0,
      subtitle: `${stats?.completed_transactions || 0} hoàn thành`,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats?.total_volume || 0),
      subtitle: "Tất cả giao dịch",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      isString: true,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và quản lý các hoạt động của ZaloPay Merchant Portal
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.isString ? card.value : formatNumber(card.value as number)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-full">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getActivityDescription(activity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Bởi {activity.user} • {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.resource_type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có hoạt động nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Đã duyệt</span>
                </div>
                <span className="font-semibold">
                  {formatNumber(stats?.approved_registrations || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Chờ duyệt</span>
                </div>
                <span className="font-semibold">
                  {formatNumber(stats?.pending_registrations || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Chờ xác minh</span>
                </div>
                <span className="font-semibold">
                  {formatNumber(stats?.pending_verifications || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">GD hoàn thành</span>
                </div>
                <span className="font-semibold">
                  {formatNumber(stats?.completed_transactions || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getActivityIcon(action: string) {
  switch (action) {
    case "LOGIN":
      return <Users className="h-4 w-4 text-blue-600" />;
    case "UPDATE_STATUS":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "CREATE":
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
}

function getActivityDescription(activity: AuditLog): string {
  switch (activity.action) {
    case "LOGIN":
      return "Đăng nhập hệ thống";
    case "UPDATE_STATUS":
      return `Cập nhật trạng thái ${activity.resource_type}`;
    case "CREATE":
      return `Tạo mới ${activity.resource_type}`;
    default:
      return `${activity.action} ${activity.resource_type}`;
  }
}
