export interface Category {
  id: string;
  _id: string;        // ✅ Add this
  title: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  title: string;
  image: File | string;
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