import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Shield,
  ShieldOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

import {
  useFetchVendorAdmin,
  useBlockVendor,
  useUnblockVendor,
  useSearchVendors,
} from "@/hooks/adminCustomHooks";
import { toast } from "react-toastify";


import { useDebounce } from "@/hooks/useDebounce"; 
interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "blocked";
  createdAt: string;
}

const VendorRow = React.memo(
  ({
    vendor,
    onAction,
  }: {
    vendor: Vendor;
    onAction: (vendor: Vendor, action: "block" | "unblock") => void;
  }) => (
    <TableRow>
      <TableCell className="font-medium">{vendor.name}</TableCell>
      <TableCell>{vendor.company}</TableCell>
      <TableCell className="text-muted-foreground">{vendor.email}</TableCell>
      <TableCell>{vendor.phone}</TableCell>
      <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <Badge variant={vendor.status === "active" ? "default" : "destructive"}>
          {vendor.status === "active" ? "Active" : "Blocked"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {vendor.status === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onAction(vendor, "block")}
            >
              <ShieldOff className="w-4 h-4 mr-2" />
              Block
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAction(vendor, "unblock")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Unblock
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
);

export default function VendorManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<"block" | "unblock">("block");

  // This is the missing piece!
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchInput.trim(), 300);

  const { data: vendorData, isLoading } = useFetchVendorAdmin(currentPage);
  const { data: searchResults, isLoading: isSearchLoading } = useSearchVendors(debouncedSearchQuery);

  const blockVendor = useBlockVendor();
  const unblockVendor = useUnblockVendor();

  const isSearching = debouncedSearchQuery.length > 0;

  // Sync vendors from API (paginated list or search results)
  useEffect(() => {
    if (isSearching) {
      setVendors(searchResults?.vendors || []);
    } else {
      setVendors(vendorData?.vendors || []);
    }
  }, [isSearching, searchResults?.vendors, vendorData?.vendors]);

  const totalPages = isSearching ? 1 : vendorData?.totalPages || 1;

  // Reset page when starting search
  useEffect(() => {
    if (isSearching) setCurrentPage(1);
  }, [isSearching]);

  const handleAction = useCallback((vendor: Vendor, action: "block" | "unblock") => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowDialog(true);
  }, []);

  const confirmAction = useCallback(async () => {
    if (!selectedVendor) return;

    const vendorId = selectedVendor._id;

    // Optimistic UI update
    setVendors((prev) =>
      prev.map((v) =>
        v._id === vendorId
          ? { ...v, status: actionType === "block" ? "blocked" : "active" }
          : v
      )
    );

    setShowDialog(false);

    try {
      if (actionType === "block") {
        await blockVendor.mutateAsync(vendorId);
        toast.success("Vendor blocked successfully");
      } else {
        await unblockVendor.mutateAsync(vendorId);
        toast.success("Vendor unblocked successfully");
      }
    } catch (err: any) {
      // Rollback on error
      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendorId ? { ...v, status: selectedVendor.status } : v
        )
      );
      toast.error(err?.response?.data?.message || `Failed to ${actionType} vendor`);
    } finally {
      setSelectedVendor(null);
    }
  }, [selectedVendor, actionType, blockVendor, unblockVendor]);

  const clearSearch = () => setSearchInput("");

  const isLoadingNow = isLoading || (isSearching && isSearchLoading);

  if (isLoadingNow) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading vendors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">Manage vendor accounts and access</p>
        </div>

        {/* Search */}
        <div className="relative mx-auto max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          {isSearching && isSearchLoading && (
            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vendor List</CardTitle>
            {!isSearching && (
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {isSearching
                  ? `No vendors found for "${debouncedSearchQuery}"`
                  : "No vendors available"}
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <VendorRow
                        key={vendor._id}
                        vendor={vendor}
                        onAction={handleAction}
                      />
                    ))}
                  </TableBody>
                </Table>

                {!isSearching && totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionType === "block" ? "Block" : "Unblock"} Vendor
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionType}{" "}
                <strong>{selectedVendor?.name}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>
                {actionType === "block" ? "Block" : "Unblock"} Vendor
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}