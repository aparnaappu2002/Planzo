import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useFindAllCategories,useCreateCategory,useUpdateCategory,useChangeStatusCategory } from '@/hooks/adminCustomHooks';
import { CategoryCard } from './CategoryCard';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmationModal } from './ConfirmationModal';
import { Category,CreateCategoryData } from '@/types/Category';
import { CategoryUpdate } from '@/types/CategoryUpdate';


const CategoryManagement: React.FC = () => {
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToToggle, setCategoryToToggle] = useState<string | null>(null);

  // Hooks
  const { data: categoriesData, isLoading, refetch } = useFindAllCategories(currentPage);
  
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const changeStatusMutation = useChangeStatusCategory();

  // Provide default empty array if categories is undefined
  const categories = categoriesData?.categories || [];
  

  // Handlers
  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      const response = await createMutation.mutateAsync(data);
      toast.success(response.message || 'Category created successfully!');
      setIsFormModalOpen(false);
      refetch();
    } catch (error) {
      let errorMessage = "Category creation failed";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage); 
    }
  };

  const handleUpdateCategory = async (data: { categoryId: string; updates: CategoryUpdate }) => {
    try {
      const response = await updateMutation.mutateAsync(data);
      console.log('Update data sent:', data);
      toast.success(response.message || 'Category updated successfully!');
      setIsFormModalOpen(false);
      setSelectedCategory(null);
      refetch();
    } catch (error) {
      console.error('Update error:', error);
      let errorMessage = "Failed to update category";
      
      // Better error handling for 400 errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Invalid data provided. Please check all fields.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
    console.log('confirmToggleStatus called with categoryToToggle:', categoryToToggle);
    
    if (!categoryToToggle) {
      console.error('No category to toggle');
      return;
    }
    
    try {
      // Find the current category to determine the new status
      const currentCategory = categories.find(c => c._id === categoryToToggle);
      
      
      if (!currentCategory) {
        toast.error('Category not found');
        return;
      }

      // Determine the new status
      const newStatus = currentCategory.status === 'active' ? 'inactive' : 'active';
      
      const response = await changeStatusMutation.mutateAsync(categoryToToggle);
      
      console.log('Mutation response:', response);
      
      toast.success(response.message || `Category ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      setIsConfirmModalOpen(false);
      setCategoryToToggle(null);
      refetch();
    } catch (error) {
      console.error('Status toggle error:', error);
      let errorMessage = "Failed to change category status";
      
      // Better error handling for API responses
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          config: axiosError.config
        });
        
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Invalid request. Please check the category data.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "Category not found. Please refresh and try again.";
        } else if (axiosError.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Close modal even on error to prevent stuck state
      setIsConfirmModalOpen(false);
      setCategoryToToggle(null);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
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
              <p className="text-2xl font-bold text-foreground mt-1">{categories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
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
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
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
          <CardHeader>
            <CardTitle className="text-foreground">Categories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading categories...</span>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    onEdit={handleEditCategory}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
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
                } the category "${categoryToToggleData.title}"?`
              : 'Are you sure you want to change this category status?'
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