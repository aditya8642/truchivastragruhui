import { Category } from './category.model';

export interface ProductImage {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  category: Category;
  productImage?: ProductImage[];
  productImages?: ProductImage[];
}

export function getProductImageUrls(product?: Partial<Product> | null): string[] {
  const images = product?.productImage ?? product?.productImages;
  if (images?.length) {
    return images.map(image => image.imageUrl).filter((url): url is string => Boolean(url));
  }

  return ['https://placehold.co/800x1000/FAF7F0/201C18?text=Vastragruh'];
}
