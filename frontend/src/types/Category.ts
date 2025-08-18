export interface Category {
  id: string;
  title: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  title: string;
  image: File | null;
}


export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}