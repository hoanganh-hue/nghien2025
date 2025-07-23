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
  CreditCard,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import { Transaction, PaginatedResponse, FilterOptions } from "@/shared/types";
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
  debounce,
} from "@/shared/lib/utils";

export default function Transactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    page: 1,
    per_page: 20,
    status: "",
    transaction_type: "",
    partner_id: "",
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Transaction>>({
    queryKey: ["transactions", filters, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries({ ...filters, search: searchTerm }).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      return AuthService.apiRequest(`/transactions?${params.toString()}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      AuthService.apiRequest(`/transactions/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Thành công",
        description: "Trạng thái giao dịch đã được cập nhật",
      });
      setSelectedTransaction(null);
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
    mutationFn: () => AuthService.apiRequest("/transactions/export"),
    onSuccess: (data: string) => {
      const blob = new Blob([data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Thành công",
        description: "Dữ liệu giao dịch đã được xuất",
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

  const handleStatusUpdate = (status: string) => {
    if (selectedTransaction) {
      updateStatusMutation.mutate({
        id: selectedTransaction.id,
        status,
      });
    }
  };

  // Calculate stats
  const totalTransactions = data?.total || 0;
  const completedTransactions = data?.items.filter(t => t.status === "completed").length || 0;
  const pendingTransactions = data?.items.filter(t => t.status === "pending").length || 0;
  const failedTransactions = data?.items.filter(t => t.status === "failed").length || 0;
  const totalVolume = data?.items.reduce((sum, t) => sum + (t.status === "completed" ? t.amount : 0), 0) || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý giao dịch</h1>
        <p className="text-gray-600 mt-2">
          Theo dõi và quản lý tất cả giao dịch thanh toán qua ZaloPay
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTransactions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedTransactions.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingTransactions.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalVolume / 100)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
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
                  placeholder="Tìm kiếm ID giao dịch, tên đối tác..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="ID Đối tác"
                value={filters.partner_id || ""}
                onChange={(e) =>
                  setFilters({ ...filters, partner_id: e.target.value, page: 1 })
                }
                className="w-40"
              />
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
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.transaction_type}
                onValueChange={(value) =>
                  setFilters({ ...filters, transaction_type: value, page: 1 })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Loại giao dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="payment">Thanh toán</SelectItem>
                  <SelectItem value="refund">Hoàn tiền</SelectItem>
                  <SelectItem value="withdrawal">Rút tiền</SelectItem>
                  <SelectItem value="deposit">Nạp tiền</SelectItem>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["transactions"] })}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportMutation.isPending ? "Đang xuất..." : "Xuất CSV"}
              </Button>
            </div>
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
                  <TableHead>ID Giao dịch</TableHead>
                  <TableHead>Đối tác</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {transaction.transaction_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.partner_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {transaction.partner_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(transaction.amount / 100)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.currency}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getStatusLabel(transaction.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {transaction.payment_method || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(transaction.status)}
                      >
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </p>
                        {transaction.completed_at && (
                          <p className="text-xs text-gray-500">
                            Hoàn thành: {formatDate(transaction.completed_at)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        {transaction.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate("completed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Hoàn thành
                          </Button>
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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết giao dịch
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTransaction(null)}
                >
                  Đóng
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Thông tin giao dịch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID Giao dịch
                      </label>
                      <p className="text-sm font-mono">{selectedTransaction.transaction_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Số tiền
                      </label>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(selectedTransaction.amount / 100)} {selectedTransaction.currency}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Loại giao dịch
                      </label>
                      <Badge variant="outline">
                        {getStatusLabel(selectedTransaction.transaction_type)}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phương thức thanh toán
                      </label>
                      <p className="text-sm">{selectedTransaction.payment_method || "Không xác định"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Ngày tạo
                      </label>
                      <p className="text-sm">{formatDate(selectedTransaction.created_at)}</p>
                    </div>
                    {selectedTransaction.completed_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Ngày hoàn thành
                        </label>
                        <p className="text-sm">{formatDate(selectedTransaction.completed_at)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Thông tin đối tác
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Tên đối tác
                      </label>
                      <p className="text-sm">{selectedTransaction.partner_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID Đối tác
                      </label>
                      <p className="text-sm">{selectedTransaction.partner_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Trạng thái
                      </label>
                      <Badge className={getStatusColor(selectedTransaction.status)}>
                        {getStatusLabel(selectedTransaction.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {selectedTransaction.description && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Mô tả</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedTransaction.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {selectedTransaction.status === "pending" && (
                <div className="mt-6 flex justify-end gap-4">
                  <Button
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={updateStatusMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Đánh dấu hoàn thành
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("failed")}
                    disabled={updateStatusMutation.isPending}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Đánh dấu thất bại
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
