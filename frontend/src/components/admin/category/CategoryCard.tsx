import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Power, PowerOff } from 'lucide-react';
import { Category } from '@/types/Category';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleStatus: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onToggleStatus
}) => {
  const handleEdit = () => {
    onEdit(category);
  };

  const handleToggleStatus = () => {
    
    onToggleStatus(category._id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Category Image */}
        <div className="h-32 w-full overflow-hidden">
          {category.image ? (
            <img
              src={category.image}
              alt={category.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              category.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}
          >
            {category.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Category Title */}
        <h3 className="font-semibold text-foreground mb-3 truncate" title={category.title}>
          {category.title}
        </h3>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant={category.status === 'active' ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleStatus}
            className="flex-1"
          >
            {category.status === 'active' ? (
              <>
                <PowerOff className="h-3 w-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </Button>
        </div>

        {/* Debug Info - Remove this after fixing */}
        <div className="mt-2 text-xs text-gray-500">
          ID: {category._id || 'No ID'}
        </div>
      </CardContent>
    </Card>
  );
};