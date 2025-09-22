import React, { useState, useEffect, useCallback } from "react";
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
import { Shield, ShieldOff, Loader2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useFetchVendorAdmin, useBlockVendor, useUnblockVendor, useSearchVendors } from "@/hooks/adminCustomHooks";
import { toast } from "react-toastify";
import { debounce } from "lodash";

interface Vendor {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "blocked";
  createdAt: string;
}

// Memoized VendorRow component
const VendorRow = React.memo(({ vendor, handleAction }: { vendor: Vendor; handleAction: (vendor: Vendor, action: "block" | "unblock") => void }) => (
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
            onClick={() => handleAction(vendor, "block")}
          >
            <ShieldOff className="w-4 h-4 mr-2" />
            Block
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleAction(vendor, "unblock")}
          >
            <Shield className="w-4 h-4 mr-2" />
            Unblock
          </Button>
        )}
      </div>
    </TableCell>
  </TableRow>
));

const VendorManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<"block" | "unblock">("block");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]); // Local state for vendors

  const { data: vendorData, isLoading, error } = useFetchVendorAdmin(currentPage);
  const { data: searchResults, isLoading: isSearchLoading } = useSearchVendors(searchQuery);
  const blockVendor = useBlockVendor();
  const unblockVendor = useUnblockVendor();

  // Update local vendors state when vendorData or searchResults change
  useEffect(() => {
    setVendors(searchQuery ? searchResults?.vendors || [] : vendorData?.vendors || []);
  }, [searchQuery, searchResults, vendorData]);

  const totalPages = searchQuery ? 1 : vendorData?.totalPages || 1;

  // Handle vendor action (block/unblock)
  const handleAction = useCallback((vendor: Vendor, action: "block" | "unblock") => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowDialog(true);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchInput(query);
    debouncedSearch(query);
  };

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Debounced API call for block/unblock
  const debouncedBlockVendor = useCallback(
    debounce(async (vendorId: string) => {
      try {
        const response = await blockVendor.mutateAsync(vendorId);
        toast.success(response?.message || "Vendor blocked successfully.");
      } catch (error: any) {
        throw error; // Let the error be handled in confirmAction
      }
    }, 500),
    [blockVendor]
  );

  const debouncedUnblockVendor = useCallback(
    debounce(async (vendorId: string) => {
      try {
        const response = await unblockVendor.mutateAsync(vendorId);
        toast.success(response?.message || "Vendor unblocked successfully.");
      } catch (error: any) {
        throw error; // Let the error be handled in confirmAction
      }
    }, 500),
    [unblockVendor]
  );

  // Confirm action with optimistic update
  const confirmAction = useCallback(async () => {
    if (!selectedVendor) return;

    const vendorId = selectedVendor._id; // Use _id as the primary identifier
    const originalVendor = { ...selectedVendor }; // Store original vendor data for rollback

    // Debugging: Log the vendor being updated
    console.log(`Updating vendor: ${selectedVendor.name} (${vendorId}) to ${actionType === "block" ? "blocked" : "active"}`);

    // Optimistically update only the selected vendor's status
    setVendors((prevVendors) =>
      prevVendors.map((vendor) =>
        vendor._id === vendorId
          ? { ...vendor, status: actionType === "block" ? "blocked" : "active" }
          : vendor
      )
    );

    setShowDialog(false);
    setSelectedVendor(null);

    try {
      if (actionType === "block") {
        await debouncedBlockVendor(vendorId);
      } else {
        await debouncedUnblockVendor(vendorId);
      }
    } catch (error: any) {
      // Revert optimistic update for only the selected vendor
      console.log(`Error ${actionType} vendor: ${error.message}`);
      setVendors((prevVendors) =>
        prevVendors.map((vendor) =>
          vendor._id === vendorId
            ? { ...vendor, status: originalVendor.status }
            : vendor
        )
      );

      let errorMessage = `Failed to ${actionType} vendor. Please try again.`;
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  }, [selectedVendor, actionType, debouncedBlockVendor, debouncedUnblockVendor]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  if (isLoading || (searchQuery && isSearchLoading)) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading vendors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Error Loading Vendors</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => setCurrentPage(1)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground text-lg">
            Manage your vendors and their access status
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search vendors by name, email, or company..."
            className="pl-10 pr-10"
            value={searchInput}
            onChange={handleSearchChange}
          />
          {isSearchLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {searchInput && !isSearchLoading && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={clearSearch}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Vendors Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vendor List</CardTitle>
            {!searchQuery && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery ? `No vendors found for "${searchQuery}"` : "No vendors found."}
                </p>
              </div>
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
                        handleAction={handleAction} 
                      />
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination - Only show when not searching */}
                {!searchQuery && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
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
                {actionType === "block" ? "Block Vendor" : "Unblock Vendor"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionType} {selectedVendor?.name}? 
                {actionType === "block" 
                  ? " This will prevent them from accessing the platform."
                  : " This will restore their access to the platform."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAction}
                className={actionType === "block" ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                {actionType === "block" ? "Block" : "Unblock"} Vendor
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default VendorManagement;