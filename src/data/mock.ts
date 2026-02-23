export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  seller: string;
  stock: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  productCount: number;
  since: string;
}

export const categories: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics", icon: "📱", productCount: 1240 },
  { id: "2", name: "Fashion", slug: "fashion", icon: "👗", productCount: 3420 },
  { id: "3", name: "Home & Garden", slug: "home-garden", icon: "🏡", productCount: 890 },
  { id: "4", name: "Sports", slug: "sports", icon: "⚽", productCount: 670 },
  { id: "5", name: "Books", slug: "books", icon: "📚", productCount: 2100 },
  { id: "6", name: "Beauty", slug: "beauty", icon: "💄", productCount: 1560 },
  { id: "7", name: "Toys", slug: "toys", icon: "🧸", productCount: 430 },
  { id: "8", name: "Automotive", slug: "automotive", icon: "🚗", productCount: 780 },
];

export const products: Product[] = [
  { id: "1", name: "Wireless Noise-Cancelling Headphones", price: 249.99, originalPrice: 349.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", category: "Electronics", rating: 4.7, reviewCount: 2341, seller: "TechVault", stock: 45, description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio." },
  { id: "2", name: "Organic Cotton T-Shirt", price: 29.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", category: "Fashion", rating: 4.3, reviewCount: 876, seller: "EcoWear", stock: 200, description: "Soft, sustainable organic cotton t-shirt available in multiple colors." },
  { id: "3", name: "Smart Home Security Camera", price: 89.99, originalPrice: 129.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", category: "Electronics", rating: 4.5, reviewCount: 1203, seller: "SecureHome", stock: 78, description: "1080p HD security camera with night vision, two-way audio, and cloud storage." },
  { id: "4", name: "Yoga Mat Premium", price: 49.99, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop", category: "Sports", rating: 4.8, reviewCount: 543, seller: "FitGear", stock: 120, description: "Extra-thick, non-slip yoga mat made from eco-friendly materials." },
  { id: "5", name: "Bestseller Novel Collection", price: 34.99, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop", category: "Books", rating: 4.6, reviewCount: 1890, seller: "BookHaven", stock: 300, description: "Curated collection of this year's bestselling novels." },
  { id: "6", name: "Luxury Skincare Set", price: 79.99, originalPrice: 99.99, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop", category: "Beauty", rating: 4.4, reviewCount: 672, seller: "GlowUp", stock: 55, description: "Complete skincare routine with cleanser, serum, moisturizer, and SPF." },
  { id: "7", name: "Mechanical Gaming Keyboard", price: 159.99, image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop", category: "Electronics", rating: 4.9, reviewCount: 3201, seller: "TechVault", stock: 32, description: "RGB mechanical keyboard with cherry MX switches and programmable keys." },
  { id: "8", name: "Indoor Plant Collection", price: 44.99, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop", category: "Home & Garden", rating: 4.2, reviewCount: 328, seller: "GreenThumb", stock: 67, description: "Set of 3 low-maintenance indoor plants perfect for any room." },
  { id: "9", name: "Running Shoes Pro", price: 129.99, originalPrice: 179.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", category: "Sports", rating: 4.6, reviewCount: 1567, seller: "FitGear", stock: 89, description: "Lightweight running shoes with responsive cushioning and breathable mesh." },
  { id: "10", name: "Wooden Building Blocks", price: 24.99, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop", category: "Toys", rating: 4.7, reviewCount: 445, seller: "KidWorld", stock: 150, description: "100-piece wooden building block set for creative play." },
  { id: "11", name: "Car Dash Camera 4K", price: 69.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop", category: "Automotive", rating: 4.3, reviewCount: 892, seller: "AutoParts", stock: 43, description: "4K dash camera with wide-angle lens, GPS, and loop recording." },
  { id: "12", name: "Designer Sunglasses", price: 189.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", category: "Fashion", rating: 4.5, reviewCount: 1023, seller: "EcoWear", stock: 28, description: "UV400 protection polarized sunglasses with titanium frame." },
];

export const sellers: Seller[] = [
  { id: "1", name: "TechVault", rating: 4.8, productCount: 234, since: "2021" },
  { id: "2", name: "EcoWear", rating: 4.5, productCount: 156, since: "2020" },
  { id: "3", name: "FitGear", rating: 4.7, productCount: 89, since: "2022" },
  { id: "4", name: "BookHaven", rating: 4.9, productCount: 412, since: "2019" },
  { id: "5", name: "GlowUp", rating: 4.6, productCount: 78, since: "2023" },
];

export const mockOrders = [
  { id: "ORD-001", date: "2026-02-20", total: 279.98, status: "Delivered", items: 2 },
  { id: "ORD-002", date: "2026-02-18", total: 89.99, status: "Shipped", items: 1 },
  { id: "ORD-003", date: "2026-02-15", total: 164.97, status: "Processing", items: 3 },
  { id: "ORD-004", date: "2026-02-10", total: 49.99, status: "Delivered", items: 1 },
  { id: "ORD-005", date: "2026-02-08", total: 329.97, status: "Delivered", items: 3 },
];
