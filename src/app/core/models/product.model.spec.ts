import { getProductImageUrls, Product } from './product.model';

describe('getProductImageUrls', () => {
  it('returns URLs from the backend productImage field', () => {
    const product: Partial<Product> = {
      productImage: [{ id: 1, imageUrl: 'https://example.com/a.jpg', primaryImage: true }]
    };

    expect(getProductImageUrls(product as Product)).toEqual(['https://example.com/a.jpg']);
  });

  it('falls back to productImages when present', () => {
    const product: Partial<Product> = {
      productImages: [{ id: 2, imageUrl: 'https://example.com/b.jpg', primaryImage: false }]
    };

    expect(getProductImageUrls(product as Product)).toEqual(['https://example.com/b.jpg']);
  });

  it('returns placeholder when no images are available', () => {
    const product: Partial<Product> = {};

    expect(getProductImageUrls(product as Product)).toEqual(['https://placehold.co/800x1000/FAF7F0/201C18?text=Vastragruh']);
  });
});
