import { Link, useLocation } from "wouter";
import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const navigation = [
  {
    name: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Đăng ký đối tác",
    href: "/registrations",
    icon: Users,
  },
  {
    name: "Xác minh tài khoản",
    href: "/verifications",
    icon: Shield,
  },
  {
    name: "Giao dịch",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    name: "Cài đặt",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img
              src="https://stc-zaloprofile.zdn.vn/pc/v1/images/logo_zalopay.png"
              alt="ZaloPay"
              className="h-8"
            />
            <span className="text-lg font-semibold text-gray-900">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-900"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        collapsed ? "mr-0" : "mr-3"
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={onLogout}
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
          {!collapsed && <span>Đăng xuất</span>}
        </Button>
      </div>
    </div>
  );
}
