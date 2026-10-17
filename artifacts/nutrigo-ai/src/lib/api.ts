export interface NutritionLabelResponse {
  item_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface CartItem extends NutritionLabelResponse {
  id: string;
  user_email: string;
  quantity: number;
}

export type CartItemUpdate = Partial<
  Pick<CartItem, 'item_name' | 'calories' | 'protein' | 'carbs' | 'fat' | 'quantity'>
>;

const API_URL = '/api/nutrigo';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { detail?: string; message?: string };
      message = payload.detail || payload.message || message;
    } catch {
      // Keep the status-based message when the API does not return JSON.
    }
    throw new Error(message);
  }
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

export function checkApiConnection(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}

export function scanLabel(file: File): Promise<NutritionLabelResponse> {
  const body = new FormData();
  body.append('file', file);
  return request<NutritionLabelResponse>('/ai/scan-label', { method: 'POST', body });
}

export function getCart(userEmail: string): Promise<CartItem[]> {
  return request<CartItem[]>(`/cart?user_email=${encodeURIComponent(userEmail)}`);
}

export function addCartItem(
  item: NutritionLabelResponse,
  userEmail: string,
  quantity: number,
): Promise<CartItem> {
  return request<CartItem>('/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...item, user_email: userEmail, quantity }),
  });
}

export function updateCartItem(id: string, changes: CartItemUpdate): Promise<void> {
  return request<void>(`/cart/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
}

export function deleteCartItem(id: string): Promise<void> {
  return request<void>(`/cart/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
