import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

// Your custom hooks
import { 
  useFindAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useChangeStatusCategory 
} from '@/hooks/adminCustomHooks';

// Components
import { CategoryCard } from './CategoryCard';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmationModal } from './ConfirmationModal';
import Pagination from '@/components/other components/Pagination';

// Types
import { Category, CreateCategoryData } from '@/types/Category';
import { CategoryUpdate } from '@/types/CategoryUpdate';

const CategoryManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<string | null>(null);

  // Fetch categories with pagination
  const { 
    data: categoriesData, 
    isLoading, 
    refetch 
  } = useFindAllCategories(currentPage);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const changeStatusMutation = useChangeStatusCategory();

  // Extract data
  const categories = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;
  const totalCategories = categoriesData?.totalCategories || 0;

  // Filter categories client-side for search (since search isn't paginated)
  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      const response = await createMutation.mutateAsync(data);
      toast.success(response.message || 'Category created successfully!');
      setIsFormModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Category creation failed");
    }
  };

  const handleUpdateCategory = async (data: { categoryId: string; updates: CategoryUpdate }) => {
    try {
      const response = await updateMutation.mutateAsync(data);
      toast.success(response.message || 'Category updated successfully!');
      setIsFormModalOpen(false);
      setSelectedCategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleFormSubmit = (data: CreateCategoryData | { categoryId: string; updates: CategoryUpdate }) => {
    if ('categoryId' in data) {
      handleUpdateCategory(data);
    } else {
      handleCreateCategory(data);
    }
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategoryToToggle(categoryId);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!categoryToToggle) return;

    try {
      const currentCategory = categories.find(c => c._id === categoryToToggle);
      const newStatus = currentCategory?.status === 'active' ? 'inactive' : 'active';

      await changeStatusMutation.mutateAsync(categoryToToggle);
      toast.success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      
      setIsConfirmModalOpen(false);
      setCategoryToToggle(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change status");
      setIsConfirmModalOpen(false);
      setCategoryToToggle(null);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const categoryToToggleData = categories.find(c => c._id === categoryToToggle);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Category Management</h1>
              <p className="text-primary-foreground/80">
                Manage your product categories efficiently
              </p>
            </div>
            <Button
              onClick={() => setIsFormModalOpen(true)}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="border-primary/20 hover:bg-primary/5"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Total Categories</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">{totalCategories}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">
                {categories.filter(c => c.status === 'active').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Inactive</span>
              </div>
              <p className="text-2xl font-bold text-foreground mt-1">
                {categories.filter(c => c.status === 'inactive').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">
              Categories ({searchTerm ? filteredCategories.length : categories.length})
            </CardTitle>
            {!searchTerm && totalPages > 1 && (
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? `No categories found for "${searchTerm}"` : "No categories available"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCategories.map((category) => (
                    <CategoryCard
                      key={category._id}
                      category={category}
                      onEdit={handleEditCategory}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>

                {/* Pagination - Only show when not searching */}
                {!searchTerm && totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      total={totalPages}
                      current={currentPage}
                      setPage={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <CategoryFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleFormSubmit}
          category={selectedCategory}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setCategoryToToggle(null);
          }}
          onConfirm={confirmToggleStatus}
          title="Change Category Status"
          description={
            categoryToToggleData
              ? `Are you sure you want to ${
                  categoryToToggleData.status === 'active' ? 'deactivate' : 'activate'
                } "${categoryToToggleData.title}"?`
              : 'Are you sure?'
          }
          isLoading={changeStatusMutation.isPending}
          confirmText={
            categoryToToggleData?.status === 'active' ? 'Deactivate' : 'Activate'
          }
          variant="warning"
        />
      </div>
    </div>
  );
};

export default CategoryManagement;