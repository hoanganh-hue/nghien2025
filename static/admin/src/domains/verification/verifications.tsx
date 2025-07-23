import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/shared/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Shield,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  FileText,
  User,
  Building,
} from "lucide-react";
import { AccountVerification, PaginatedResponse, FilterOptions } from "@/shared/types";
import {
  formatDate,
  getStatusColor,
  getStatusLabel,
  debounce,
} from "@/shared/lib/utils";

export default function Verifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    per_page: 20,
    status: "",
  });
  const [selectedVerification, setSelectedVerification] = useState<AccountVerification | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<AccountVerification>>({
    queryKey: ["verifications", filters, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries({ ...filters, search: searchTerm }).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      return AuthService.apiRequest(`/verifications?${params.toString()}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      AuthService.apiRequest(`/verifications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
      toast({
        title: "Thành công",
        description: "Trạng thái xác minh đã được cập nhật",
      });
      setSelectedVerification(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => AuthService.apiRequest("/verifications/export"),
    onSuccess: (data: string) => {
      const blob = new Blob([data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `verifications_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Thành công",
        description: "Dữ liệu xác minh đã được xuất",
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

  const debouncedSearch = debounce((value: string) => {
    setFilters({ ...filters, page: 1 });
  }, 500);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleStatusUpdate = (status: string, notes?: string) => {
    if (selectedVerification) {
      updateStatusMutation.mutate({
        id: selectedVerification.id,
        status,
        notes,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý xác minh tài khoản</h1>
        <p className="text-gray-600 mt-2">
          Xem xét và phê duyệt các yêu cầu xác minh tài khoản đối tác
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data?.items.filter(v => v.status === "pending").length || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {data?.items.filter(v => v.status === "approved").length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-600">
                  {data?.items.filter(v => v.status === "rejected").length || 0}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên đối tác..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value, page: 1 })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="under_review">Đang xem xét</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending ? "Đang xuất..." : "Xuất CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-500">Đang tải...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đối tác</TableHead>
                  <TableHead>Loại email</TableHead>
                  <TableHead>Loại xác minh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {verification.email_type === "business" ? (
                            <Building className="h-4 w-4 text-gray-600" />
                          ) : (
                            <User className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {verification.partner_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {verification.partner_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getStatusLabel(verification.email_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">
                        {verification.verification_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(verification.status)}
                      >
                        {getStatusLabel(verification.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(verification.submitted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedVerification(verification)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        {verification.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate("approved")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate("rejected")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
              disabled={filters.page === 1}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {filters.page} / {data.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
              disabled={filters.page === data.pages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết yêu cầu xác minh
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVerification(null)}
                >
                  Đóng
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin yêu cầu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Đối tác
                      </label>
                      <p className="text-sm">{selectedVerification.partner_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID Đối tác
                      </label>
                      <p className="text-sm">{selectedVerification.partner_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Loại email
                      </label>
                      <Badge variant="outline">
                        {getStatusLabel(selectedVerification.email_type)}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Loại xác minh
                      </label>
                      <p className="text-sm">{selectedVerification.verification_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày gửi
                      </label>
                      <p className="text-sm">{formatDate(selectedVerification.submitted_at)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Hiện tại
                      </label>
                      <Badge className={getStatusColor(selectedVerification.status)}>
                        {getStatusLabel(selectedVerification.status)}
                      </Badge>
                    </div>
                    {selectedVerification.reviewed_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ngày xem xét
                        </label>
                        <p className="text-sm">{formatDate(selectedVerification.reviewed_at)}</p>
                      </div>
                    )}
                    {selectedVerification.reviewer && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Người xem xét
                        </label>
                        <p className="text-sm">{selectedVerification.reviewer}</p>
                      </div>
                    )}
                    {selectedVerification.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ghi chú
                        </label>
                        <p className="text-sm">{selectedVerification.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {selectedVerification.description && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Mô tả chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedVerification.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedVerification.uploaded_files && selectedVerification.uploaded_files.length > 0 && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Tài liệu đính kèm
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVerification.uploaded_files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.original_filename}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.file_size / 1024 / 1024).toFixed(2)} MB • {formatDate(file.uploaded_at)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Download file logic
                                window.open(`/api/files/${file.id}/download`, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {selectedVerification.status === "pending" && (
                <div className="mt-6 flex justify-end gap-4">
                  <Button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Phê duyệt xác minh
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("under_review")}
                    disabled={updateStatusMutation.isPending}
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Đang xem xét
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={updateStatusMutation.isPending}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối xác minh
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
