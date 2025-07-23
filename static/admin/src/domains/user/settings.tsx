import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/shared/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import {
  User,
  Shield,
  Key,
  Bell,
  Globe,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { User as UserType } from "@/shared/types";
import { formatDate } from "@/shared/lib/utils";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["current-user"],
    queryFn: () => AuthService.getCurrentUser(),
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: typeof passwordForm) =>
      AuthService.apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      }),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được cập nhật",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới không khớp",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 8 ký tự",
        variant: "destructive",
      });
      return;
    }

    updatePasswordMutation.mutate(passwordForm);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600 mt-2">
          Quản lý thông tin cá nhân và cài đặt hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <Input
                value={user?.username || ""}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                value={user?.email || ""}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Quyền hạn
              </label>
              <div className="mt-1">
                <Badge variant={user?.is_superuser ? "default" : "secondary"}>
                  {user?.is_superuser ? "Super Admin" : "Admin"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Lần đăng nhập cuối
              </label>
              <p className="mt-1 text-sm text-gray-600">
                {user?.last_login ? formatDate(user.last_login) : "Chưa có"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="relative mt-1">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="w-full"
              >
                {updatePasswordMutation.isPending ? (
                  "Đang cập nhật..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật mật khẩu
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Xác thực hai yếu tố
                </p>
                <p className="text-xs text-gray-500">
                  Bảo vệ tài khoản với lớp bảo mật bổ sung
                </p>
              </div>
              <Badge variant="outline">Sắp có</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Phiên đăng nhập
                </p>
                <p className="text-xs text-gray-500">
                  Quản lý các phiên đăng nhập hoạt động
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Xem chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Email thông báo
                </p>
                <p className="text-xs text-gray-500">
                  Nhận thông báo qua email
                </p>
              </div>
              <Badge variant="success">Bật</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Thông báo đăng ký mới
                </p>
                <p className="text-xs text-gray-500">
                  Thông báo khi có đăng ký đối tác mới
                </p>
              </div>
              <Badge variant="success">Bật</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Báo cáo hàng tuần
                </p>
                <p className="text-xs text-gray-500">
                  Nhận báo cáo thống kê hàng tuần
                </p>
              </div>
              <Badge variant="outline">Tắt</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
