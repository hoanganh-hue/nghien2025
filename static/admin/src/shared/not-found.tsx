import { Link } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Không tìm thấy trang
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="flex items-center justify-center">
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ{" "}
            <a
              href="mailto:admin@zalopay.vn"
              className="text-blue-600 hover:text-blue-500"
            >
              admin@zalopay.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
