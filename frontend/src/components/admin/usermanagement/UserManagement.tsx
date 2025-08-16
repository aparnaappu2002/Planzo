import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useFetchClientsAdmin,
  useBlockClient,
  useUnblockClient,
  useSearchClients
} from "@/hooks/adminCustomHooks";
import { toast } from "react-toastify";

// Custom hook for debounced value
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    type: null,
    user: null,
  });

  const [localUserUpdates, setLocalUserUpdates] = useState({});
  
  // Ref for the search input
  const searchInputRef = useRef(null);
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);

  const fetchClientQuery = useFetchClientsAdmin(currentPage);
  const searchClientQuery = useSearchClients(debouncedSearchTerm);
  const blockClientMutation = useBlockClient();
  const unblockClientMutation = useUnblockClient();

  // Determine which data to display based on search state
  const isSearching = debouncedSearchTerm.length > 0;
  const activeQuery = isSearching ? searchClientQuery : fetchClientQuery;

  // Memoize data extraction to prevent unnecessary re-calculations
  const {
    clients,
    totalPages,
    totalUsers,
    currentPageFromAPI,
    limit,
    startIndex,
    endIndex
  } = useMemo(() => {
    const clientsData = isSearching 
      ? searchClientQuery?.data?.clients || [] 
      : fetchClientQuery?.data?.clients || [];
    
    const totalPagesData = isSearching ? 1 : (fetchClientQuery?.data?.totalPages || 1);
    const totalUsersData = isSearching 
      ? searchClientQuery?.data?.totalUsers || clientsData.length
      : fetchClientQuery?.data?.totalUsers || 0;
    const currentPageFromAPIData = isSearching ? 1 : (fetchClientQuery?.data?.currentPage || currentPage);
    const limitData = fetchClientQuery?.data?.limit || 5;

    // Calculate display indices
    const startIndexData = isSearching ? 1 : ((currentPage - 1) * limitData + 1);
    const endIndexData = isSearching ? clientsData.length : Math.min(currentPage * limitData, totalUsersData);

    return {
      clients: clientsData,
      totalPages: totalPagesData,
      totalUsers: totalUsersData,
      currentPageFromAPI: currentPageFromAPIData,
      limit: limitData,
      startIndex: startIndexData,
      endIndex: endIndexData
    };
  }, [
    isSearching, 
    searchClientQuery?.data, 
    fetchClientQuery?.data, 
    currentPage
  ]);



  // Reset page when starting/stopping search
  useEffect(() => {
    if (isSearching) {
      setCurrentPage(1);
    }
  }, [isSearching]);

  // Memoized search handler to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    // Focus back to input after clearing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  }, []);

  const showConfirmation = useCallback((user, action) => {
    setAlertDialog({
      open: true,
      type: action,
      user: user,
    });
  }, []);

  const confirmAction = async () => {
    try {
      const userId = alertDialog.user._id;

      if (alertDialog.type === "block") {
        setLocalUserUpdates((prev) => ({
          ...prev,
          [userId]: { status: "block", timestamp: Date.now() },
        }));

        await blockClientMutation.mutateAsync(userId);
        toast.success("User blocked successfully");
      } else if (alertDialog.type === "unblock") {
        setLocalUserUpdates((prev) => ({
          ...prev,
          [userId]: { status: "active", timestamp: Date.now() },
        }));

        await unblockClientMutation.mutateAsync(userId);
        toast.success("User unblocked successfully");
      }

      setAlertDialog({ open: false, type: null, user: null });
      
      // Refetch appropriate query
      if (isSearching) {
        await searchClientQuery.refetch();
      } else {
        await fetchClientQuery.refetch();
      }
    } catch (error) {
      console.error("Error performing action:", error);

      const userId = alertDialog.user._id;
      setLocalUserUpdates((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });

      toast.error(`Failed to ${alertDialog.type} user. Please try again.`);
      setAlertDialog({ open: false, type: null, user: null });
    }
  };

  // Memoized utility functions
  const getStatusColor = useCallback((status) => {
    const normalizedStatus = status?.toString().toLowerCase();
    switch (normalizedStatus) {
      case "active":
      case "unblocked":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "blocked":
      case "block":
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  }, []);

  const getRoleColor = useCallback((role) => {
    switch (role) {
      case "Admin":
        return "bg-primary/10 text-primary";
      case "Moderator":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  }, []);

  const getCurrentUserStatus = useCallback((user) => {
    const userId = user._id || user.clientId;
    const localUpdate = localUserUpdates[userId];

    if (localUpdate) {
      return localUpdate.status;
    }

    return user.status || "active";
  }, [localUserUpdates]);

  const isUserBlocked = useCallback((user) => {
    const currentStatus = getCurrentUserStatus(user);
    return currentStatus === "block";
  }, [getCurrentUserStatus]);

  const getDisplayStatus = useCallback((user) => {
    const currentStatus = getCurrentUserStatus(user);

    if (currentStatus === "active") {
      return "Active";
    } else if (currentStatus === "block") {
      return "Blocked";
    }

    return "Active";
  }, [getCurrentUserStatus]);

  // Backend pagination handlers - only work when not searching
  const goToFirstPage = useCallback(() => {
    if (!isSearching && currentPage !== 1 && !fetchClientQuery.isLoading) {
      setCurrentPage(1);
    }
  }, [isSearching, currentPage, fetchClientQuery.isLoading]);
  
  const goToPreviousPage = useCallback(() => {
    if (!isSearching && currentPage > 1 && !fetchClientQuery.isLoading) {
      setCurrentPage(prev => prev - 1);
    }
  }, [isSearching, currentPage, fetchClientQuery.isLoading]);
  
  const goToNextPage = useCallback(() => {
    if (!isSearching && currentPage < totalPages && !fetchClientQuery.isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [isSearching, currentPage, totalPages, fetchClientQuery.isLoading]);
  
  const goToLastPage = useCallback(() => {
    if (!isSearching && currentPage !== totalPages && !fetchClientQuery.isLoading) {
      setCurrentPage(totalPages);
    }
  }, [isSearching, currentPage, totalPages, fetchClientQuery.isLoading]);

  // Show loading state only for initial load or when searching changes
  const showLoading = activeQuery.isLoading && (!isSearching || debouncedSearchTerm !== searchTerm.trim());
  const formatDate = (dateString) => {
  if (!dateString) return "Never";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return "N/A";
  }
};
  if (showLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">
          {isSearching ? "Searching users..." : "Loading users..."}
        </div>
      </div>
    );
  }

  if (activeQuery.isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Error {isSearching ? "searching" : "loading"} users: {activeQuery.error?.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage and monitor user accounts
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {isSearching 
              ? `Search results for "${debouncedSearchTerm}" (${clients.length} users found)`
              : `A list of all users in your system (${totalUsers} total users)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search users by name, email, or client ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
                autoComplete="off"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {/* Loading indicator for search */}
              {searchTerm.trim() !== debouncedSearchTerm && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Users List */}
            {clients.length > 0 ? (
              clients.map((user, index) => {
                
                const userBlocked = isUserBlocked(user);
                const displayStatus = getDisplayStatus(user);
                
                return (
                  <div
                    key={user.clientId || user._id || index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") ||
                            user.email?.[0]?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name || "N/A"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ClientID: {user.clientId || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge className={getRoleColor(user.role || "User")}>
                        {user.role || "User"}
                      </Badge>
                      <Badge className={getStatusColor(displayStatus)}>
                        {displayStatus}
                      </Badge>
                      <div className="text-sm text-muted-foreground min-w-[100px]">
                        {formatDate(user.lastLogin) || "N/A"}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!userBlocked ? (
                            <DropdownMenuItem
                              onClick={() => showConfirmation(user, "block")}
                              className="text-destructive"
                            >
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Block User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => showConfirmation(user, "unblock")}
                              className="text-green-600"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Unblock User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isSearching 
                  ? `No users found matching "${debouncedSearchTerm}"`
                  : "No users found"
                }
              </div>
            )}
          </div>

          {/* Backend Pagination Controls - Hidden during search */}
          {!isSearching && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {totalUsers} users
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1 || fetchClientQuery.isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || fetchClientQuery.isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1 min-w-[120px] justify-center">
                  {fetchClientQuery.isLoading ? (
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Page</span>
                      <span className="text-sm font-medium">
                        {currentPage} of {totalPages}
                      </span>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || fetchClientQuery.isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages || fetchClientQuery.isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Search Results Info - Shown during search */}
          {isSearching && clients.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground text-center">
                Showing {clients.length} search result{clients.length !== 1 ? 's' : ''} for "{debouncedSearchTerm}"
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) =>
          !open && setAlertDialog({ open: false, type: null, user: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertDialog.type === "block" ? "Block User" : "Unblock User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {alertDialog.type} user "
              {alertDialog.user?.name}"?
              {alertDialog.type === "block"
                ? " This will prevent them from accessing the system."
                : " This will restore their access to the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={
                blockClientMutation.isPending || unblockClientMutation.isPending
              }
              className={
                alertDialog.type === "block"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {blockClientMutation.isPending || unblockClientMutation.isPending
                ? "Processing..."
                : alertDialog.type === "block"
                ? "Block User"
                : "Unblock User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}