import { Bell, Search, User } from "lucide-react";
import { Button, type ButtonProps } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { User as UserType } from "@/shared/types";
import { formatDate } from "@/shared/lib/utils";

interface HeaderProps {
  user: UserType | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Logo thương hiệu */}
      <div className="flex items-center mr-6">
        <img src="/logo-zalopay-doanhnghiep.svg" alt="ZaloPay Logo" className="h-10 w-auto" />
      </div>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs p-0 flex items-center justify-center"
          >
            3
          </Badge>
        </Button>

        {/* User info */}
        {user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">
                {user.last_login ? `Lần cuối: ${formatDate(user.last_login)}` : "Chưa đăng nhập"}
              </p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
