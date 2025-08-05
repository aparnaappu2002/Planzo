import { useState, useEffect } from "react";
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
import { Eye, Clock, Users, CheckCircle } from "lucide-react";
import VendorDetailModal, { PendingVendor } from "./VendorDetailedModal";
import {
  useFetchPendingVendors,
  useApprovePendingVendor,
  useRejectPendingVendor,
} from "@/hooks/adminCustomHooks";

const PendingVendors = () => {
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<PendingVendor | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  
  const {
    data: fetchedVendors,
    isLoading,
    error,
    refetch,
  } = useFetchPendingVendors(currentPage);
  const { mutate: approveVendor, isLoading: isApproving } =
    useApprovePendingVendor();
  const { mutate: rejectVendor, isLoading: isRejecting } =
    useRejectPendingVendor();

  
  useEffect(() => {
    if (fetchedVendors) {
      let vendorsArray = [];
      if (Array.isArray(fetchedVendors)) {
        vendorsArray = fetchedVendors;
      } else if (
        fetchedVendors &&
        Array.isArray(fetchedVendors.pendingVendors)
      ) {
        vendorsArray = fetchedVendors.pendingVendors;
      } else if (fetchedVendors && Array.isArray(fetchedVendors.data)) {
        vendorsArray = fetchedVendors.data;
      } else if (fetchedVendors && Array.isArray(fetchedVendors.vendors)) {
        vendorsArray = fetchedVendors.vendors;
      } else {
        console.error(
          "fetchedVendors is not in expected format:",
          fetchedVendors
        );
        return;
      }

      if (vendorsArray.length > 0) {
        console.log("First vendor:", vendorsArray[0]);
      }

      setPendingVendors(vendorsArray);
    }
  }, [fetchedVendors]);

  const handleViewDetails = (vendor: PendingVendor) => {
    setSelectedVendor(vendor);
    setShowDetailModal(true);
  };

  const handleApprove = async (params: {
    vendorId: string;
    newStatus: string;
  }) => {
    try {
      await approveVendor(params, {
        onSuccess: (response) => {
          setPendingVendors(
            (prev) =>
              prev?.filter((vendor) => vendor.vendorId !== params.vendorId) ||
              []
          );

          refetch();

          return response;
        },
        onError: (error) => {
          console.error("Failed to approve vendor:", error);

          throw error;
        },
      });
    } catch (error) {
      console.error("Error approving vendor:", error);
      throw error;
    }
  };

  const handleReject = async (params: {
    vendorId: string;
    newStatus: string;
    rejectionReason: string;
  }) => {
    try {
      await rejectVendor(params, {
        onSuccess: (response) => {
          setPendingVendors(
            (prev) =>
              prev?.filter((vendor) => vendor.vendorId !== params.vendorId) ||
              []
          );

          refetch();

          return response;
        },
        onError: (error) => {
          console.error("Failed to reject vendor:", error);
        },
      });
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      throw error;
    }
  };

  
  const totalPending = pendingVendors?.length || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading pending vendors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <p className="text-red-500">
              Error loading pending vendors: {error.message}
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Pending Vendor Applications
          </h1>
          <p className="text-muted-foreground text-lg">
            Review and approve vendor applications to expand your network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{totalPending}</p>
                  <p className="text-sm text-muted-foreground">
                    Pending Applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Applications ({totalPending})</CardTitle>
          </CardHeader>
          <CardContent>
            {totalPending === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  All Caught Up!
                </h3>
                <p className="text-muted-foreground">
                  No pending vendor applications to review.
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
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendors.map((vendor) => (
                    <TableRow key={vendor._id}>
                      <TableCell className="font-medium">
                        {vendor.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {vendor.email}
                      </TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {vendor.vendorId.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          {vendor.vendorStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(vendor)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Vendor Detail Modal */}
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
