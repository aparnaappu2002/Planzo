export interface IchangeCategoryStatusUseCase {
    changeStatusCategory(categoryId: string): Promise<boolean>
}