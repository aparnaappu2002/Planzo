import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Phone,
  Calendar,
  User,
  Image,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

export interface PendingVendor {
  _id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: number;
  status: string;
  idProof: string;
  createdAt: string;
  updatedAt: string;
  vendorStatus: string;
  role: string;
  onlineStatus: string;
  lastLogin: string;
  rejectionReason: string | null;
  __v: number;
}

interface VendorDetailModalProps {
  vendor: PendingVendor | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (params: { vendorId: string; newStatus: string }) => Promise<any>;
  onReject: (params: {
    vendorId: string;
    newStatus: string;
    rejectionReason: string;
  }) => Promise<any>;
  isApproving?: boolean;
  isRejecting?: boolean;
}

const VendorDetailModal = ({
  vendor,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: VendorDetailModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  if (!vendor) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const response = await onApprove({
        vendorId: vendor._id,
        newStatus: "approved",
      });
      toast.success(response?.message || "Vendor approved successfully!");
      onClose();
      resetRejectionState();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to approve vendor";
      toast.error(errorMessage);
      console.error("Error approving vendor:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectionInput(true);
    setRejectionError("");
  };

  const handleCancelReject = () => {
    resetRejectionState();
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Please provide a reason for rejection");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setRejectionError("Rejection reason must be at least 10 characters long");
      return;
    }

    setIsProcessing(true);
    setRejectionError("");

    try {
      const response = await onReject({
        vendorId: vendor._id,
        newStatus: "rejected",
        rejectionReason: rejectionReason.trim(),
      });

      toast.success(response?.message || "Vendor rejected successfully!");
      onClose();
      resetRejectionState();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to reject vendor";
      toast.error(errorMessage);
      console.error("Error rejecting vendor:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRejectionState = () => {
    setShowRejectionInput(false);
    setRejectionReason("");
    setRejectionError("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isProcessingAny = isProcessing || isApproving || isRejecting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5" />
            Vendor Application Details
          </DialogTitle>
          <DialogDescription>
            Review the vendor application and approve or reject their request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-foreground font-medium">{vendor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Vendor ID
                  </label>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {vendor.vendorId}
                  </code>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <Badge variant="secondary">{vendor.role}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Status
                  </label>
                  <Badge
                    variant={
                      vendor.vendorStatus === "pending"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      vendor.vendorStatus === "pending"
                        ? "bg-orange-100 text-orange-800"
                        : ""
                    }
                  >
                    {vendor.vendorStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <p className="text-foreground font-medium">{vendor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <p className="text-foreground font-medium">
                    +91 {vendor.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Online Status
                  </label>
                  <Badge
                    variant={
                      vendor.onlineStatus === "online" ? "default" : "secondary"
                    }
                  >
                    {vendor.onlineStatus}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </label>
                  <p className="text-foreground font-medium text-sm">
                    {formatDate(vendor.lastLogin)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Proof Document */}
          {vendor.idProof && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Identity Proof Document
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(vendor.idProof, "_blank")}
                      className="flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      View Document
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/50">
                    <img
                      src={vendor.idProof}
                      alt="ID Proof"
                      className="max-w-full max-h-64 object-contain mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Application Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Application Date
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDate(vendor.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDate(vendor.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason Input (when rejecting) */}
          {showRejectionInput && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Rejection Reason
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="rejectionReason"
                      className="text-sm font-medium"
                    >
                      Please provide a detailed reason for rejecting this vendor
                      application:
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Enter the reason for rejection (minimum 10 characters)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-2 min-h-[100px]"
                      disabled={isProcessingAny}
                    />
                    {rejectionError && (
                      <p className="text-sm text-red-600 mt-2">
                        {rejectionError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Characters: {rejectionReason.length} (minimum 10 required)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Rejection Reason (if applicable) */}
          {vendor.rejectionReason && !showRejectionInput && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Previous Rejection Reason
                </h3>
                <p className="text-foreground">{vendor.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={showRejectionInput ? handleCancelReject : onClose}
              disabled={isProcessingAny}
            >
              {showRejectionInput ? "Cancel Rejection" : "Cancel"}
            </Button>

            {showRejectionInput ? (
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={isProcessingAny || !rejectionReason.trim()}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {isRejecting || isProcessing
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={handleRejectClick}
                  disabled={isProcessingAny}
                  className="flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessingAny}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isApproving || isProcessing ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailModal;
