export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string;
  washing_instructions: string;
  category_id: string | null;
  price: number;
  original_price: number;
  discount_percent: number;
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  is_trending: boolean;
  is_active: boolean;
  created_at: string;
  category?: Category;
  images?: ProductImage[];
  sizes?: ProductSize[];
  colors?: ProductColor[];
  reviews?: Review[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  label: string;
  sort_order: number;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  color: string;
  hex_code: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_percent: number;
  discount_amount: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'flash_sale' | 'limited_time' | 'bogo' | 'free_shipping' | 'festival';
  discount_percent: number;
  image_url: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  mobile: string;
  alt_mobile: string;
  email: string;
  house_number: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pin_code: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping: number;
  coupon_code: string;
  total: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  image_url: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  body: string;
  image_url: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  house_number: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pin_code: string;
  is_default: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number;
  image_url: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}
