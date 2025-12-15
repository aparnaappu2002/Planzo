import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Clock,
  CheckCircle,
  Search,
  X,
  Loader2,
} from "lucide-react";

import VendorDetailModal, { PendingVendor } from "./VendorDetailedModal";
import {
  useFetchPendingVendors,
  useApprovePendingVendor,
  useRejectPendingVendor,
  useSearchVendors,
} from "@/hooks/adminCustomHooks";
import { useDebounce } from "@/hooks/useDebounce";

const PendingVendors = () => {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage] = useState(1);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput.trim(), 400);

  // Default list
  const {
    data: fetchedVendors,
    isLoading: isLoadingList,
    error,
    refetch,
  } = useFetchPendingVendors(currentPage);

  // Search query (only runs when ≥3 chars thanks to enabled in hook)
  const {
    data: searchResults,
    isLoading: isSearchingNow,
  } = useSearchVendors(debouncedSearch);

  // Mutations
  const { mutate: approveVendor, isLoading: isApproving } = useApprovePendingVendor();
  const { mutate: rejectVendor, isLoading: isRejecting } = useRejectPendingVendor(); // ← Fixed!

  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Are we in search mode?
  const hasSearchQuery = debouncedSearch.length >= 3;

  // Choose data source
  const vendorsData = hasSearchQuery ? searchResults : fetchedVendors;

  // Normalize the array (handles different API shapes)
  const pendingVendors: PendingVendor[] = (() => {
    if (!vendorsData) return [];
    if (Array.isArray(vendorsData)) return vendorsData;
    if (Array.isArray(vendorsData.pendingVendors)) return vendorsData.pendingVendors;
    if (Array.isArray(vendorsData.vendors)) return vendorsData.vendors;
    if (Array.isArray(vendorsData.data)) return vendorsData.data;
    return [];
  })();

  const totalPending = pendingVendors.length;

  const handleViewDetails = (vendor: PendingVendor) => {
    setSelectedVendor(vendor);
    setShowDetailModal(true);
  };

  const handleApprove = async (params: { vendorId: string; newStatus: string }) => {
    await approveVendor(params, { onSuccess: () => refetch() });
  };

  const handleReject = async (params: {
    vendorId: string;
    newStatus: string;
    rejectionReason: string;
  }) => {
    await rejectVendor(params, { onSuccess: () => refetch() });
  };

  const clearSearch = () => setSearchInput("");

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const isPageLoading = isLoadingList || (hasSearchQuery && isSearchingNow);

  if (isPageLoading && !hasSearchQuery) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading pending vendors...</span>
        </div>
      </div>
    );
  }

  if (error && !hasSearchQuery) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error: {error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Pending Vendor Applications</h1>
          <p className="text-muted-foreground text-lg">
            Review and approve new vendor registrations
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-3xl font-bold">{totalPending}</p>
                    <p className="text-sm text-muted-foreground">
                      {hasSearchQuery ? "Search Results" : "Pending Applications"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-12"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          {hasSearchQuery && isSearchingNow && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {hasSearchQuery
                ? `Search Results (${totalPending})`
                : `Pending Applications (${totalPending})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalPending === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {hasSearchQuery ? "No results found" : "All Caught Up!"}
                </h3>
                <p className="text-muted-foreground">
                  {hasSearchQuery
                    ? `No vendors match "${debouncedSearch}"`
                    : "No pending applications to review."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendors.map((vendor) => (
                    <TableRow key={vendor._id || vendor.vendorId}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell className="text-muted-foreground">{vendor.email}</TableCell>
                      <TableCell>{vendor.phone || "—"}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {(vendor.vendorId || vendor._id || "").toString().substring(0, 10)}...
                        </code>
                      </TableCell>
                      <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {vendor.vendorStatus || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(vendor)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <VendorDetailModal
          vendor={selectedVendor}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVendor(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      </div>
    </div>
  );
};

export default PendingVendors;