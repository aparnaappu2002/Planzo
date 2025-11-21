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
  useSearchClients,
} from "@/hooks/adminCustomHooks";
import { toast } from "react-toastify";

// Import your reusable debounce hook
import { useDebounce } from "@/hooks/useDebounce"; // Adjust path if needed

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    type: "block" | "unblock" | null;
    user: any;
  }>({
    open: false,
    type: null,
    user: null,
  });

  const [localUserUpdates, setLocalUserUpdates] = useState<Record<string, any>>(
    {}
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use imported reusable debounce
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 300);

  const fetchClientQuery = useFetchClientsAdmin(currentPage);
  const searchClientQuery = useSearchClients(debouncedSearchTerm);
  const blockClientMutation = useBlockClient();
  const unblockClientMutation = useUnblockClient();

  const isSearching = debouncedSearchTerm.length > 0;
  const activeQuery = isSearching ? searchClientQuery : fetchClientQuery;

  const {
    clients,
    totalPages,
    totalUsers,
    currentPageFromAPI,
    limit,
    startIndex,
    endIndex,
  } = useMemo(() => {
    const clientsData = isSearching
      ? searchClientQuery?.data?.clients || []
      : fetchClientQuery?.data?.clients || [];

    const totalPagesData = isSearching ? 1 : fetchClientQuery?.data?.totalPages || 1;
    const totalUsersData = isSearching
      ? searchClientQuery?.data?.totalUsers || clientsData.length
      : fetchClientQuery?.data?.totalUsers || 0;
    const currentPageFromAPIData = isSearching ? 1 : currentPage;
    const limitData = fetchClientQuery?.data?.limit || 5;

    const startIndexData = isSearching ? 1 : (currentPage - 1) * limitData + 1;
    const endIndexData = isSearching
      ? clientsData.length
      : Math.min(currentPage * limitData, totalUsersData);

    return {
      clients: clientsData,
      totalPages: totalPagesData,
      totalUsers: totalUsersData,
      currentPageFromAPI: currentPageFromAPIData,
      limit: limitData,
      startIndex: startIndexData,
      endIndex: endIndexData,
    };
  }, [
    isSearching,
    searchClientQuery?.data,
    fetchClientQuery?.data,
    currentPage,
  ]);

  useEffect(() => {
    if (isSearching) {
      setCurrentPage(1);
    }
  }, [isSearching]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const showConfirmation = useCallback((user: any, action: "block" | "unblock") => {
    setAlertDialog({ open: true, type: action, user });
  }, []);

  const confirmAction = async () => {
    if (!alertDialog.user) return;

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

      if (isSearching) {
        searchClientQuery.refetch();
      } else {
        fetchClientQuery.refetch();
      }
    } catch (error) {
      console.error("Action failed:", error);
      toast.error(`Failed to ${alertDialog.type} user`);

      // Revert optimistic update
      setLocalUserUpdates((prev) => {
        const updated = { ...prev };
        delete updated[alertDialog.user._id];
        return updated;
      });

      setAlertDialog({ open: false, type: null, user: null });
    }
  };

  const getStatusColor = useCallback((status: string) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "unblocked") return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (s === "blocked" || s === "block" || s === "inactive") return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    return "bg-secondary text-secondary-foreground";
  }, []);

  // FIXED: Fixed the syntax error here!
  const getRoleColor = useCallback((role?: string) => {
    if (role === "Admin") return "bg-primary/10 text-primary";
    if (role === "Moderator") return "bg-accent text-accent-foreground";
    return "bg-secondary text-secondary-foreground";
  }, []);

  const getCurrentUserStatus = useCallback(
    (user: any) => {
      const userId = user._id || user.clientId;
      return localUserUpdates[userId]?.status || user.status || "active";
    },
    [localUserUpdates]
  );

  const isUserBlocked = useCallback(
    (user: any) => getCurrentUserStatus(user) === "block",
    [getCurrentUserStatus]
  );

  const getDisplayStatus = useCallback(
    (user: any) => (getCurrentUserStatus(user) === "block" ? "Blocked" : "Active"),
    [getCurrentUserStatus]
  );

  const goToFirstPage = () => !isSearching && currentPage !== 1 && setCurrentPage(1);
  const goToPreviousPage = () => !isSearching && currentPage > 1 && setCurrentPage(p => p - 1);
  const goToNextPage = () => !isSearching && currentPage < totalPages && setCurrentPage(p => p + 1);
  const goToLastPage = () => !isSearching && currentPage !== totalPages && setCurrentPage(totalPages);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
  };

  const showLoading =
    activeQuery.isLoading &&
    (!isSearching || debouncedSearchTerm !== searchTerm.trim());

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
      <div className="flex items-center justify-center h-64 text-destructive">
        Error {isSearching ? "searching" : "loading"} users
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage and monitor user accounts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {isSearching
              ? `Search results for "${debouncedSearchTerm}" (${clients.length} found)`
              : `All users (${totalUsers} total)`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by name, email, or client ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {searchTerm.trim() !== debouncedSearchTerm && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* User List */}
          {clients.length > 0 ? (
            clients.map((user: any) => (
              <div
                key={user._id || user.clientId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex-center">
                    <span className="font-medium text-primary">
                      {(user.name || user.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{user.name || "Unnamed User"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">ID: {user.clientId || user._id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={getRoleColor(user.role)}>{user.role || "User"}</Badge>
                  <Badge className={getStatusColor(getDisplayStatus(user))}>
                    {getDisplayStatus(user)}
                  </Badge>
                  <span className="text-sm text-muted-foreground min-w-[120px]">
                    {formatDate(user.lastLogin)}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      {isUserBlocked(user) ? (
                        <DropdownMenuItem
                          onClick={() => showConfirmation(user, "unblock")}
                          className="text-green-600"
                        >
                          <Shield className="h-4 w-4 mr-2" /> Unblock User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => showConfirmation(user, "block")}
                          className="text-destructive"
                        >
                          <ShieldOff className="h-4 w-4 mr-2" /> Block User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {isSearching
                ? `No users found for "${debouncedSearchTerm}"`
                : "No users available"}
            </div>
          )}

          {/* Pagination */}
          {!isSearching && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex}–{endIndex} of {totalUsers}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={currentPage === 1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToLastPage} disabled={currentPage === totalPages}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => !open && setAlertDialog({ open: false, type: null, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertDialog.type === "block" ? "Block" : "Unblock"} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {alertDialog.type} <strong>{alertDialog.user?.name || "this user"}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              disabled={blockClientMutation.isPending || unblockClientMutation.isPending}
              className={alertDialog.type === "block" ? "bg-destructive" : "bg-green-600"}
            >
              {blockClientMutation.isPending || unblockClientMutation.isPending
                ? "Processing..."
                : alertDialog.type === "block" ? "Block User" : "Unblock User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}