import { CompletedOrder } from './types';

const names = ['Emma Johnson', 'Liam Smith', 'Olivia Williams', 'Noah Brown', 'Ava Davis', 'Sophia Martinez', 'Mason Garcia', 'Isabella Wilson', 'Ethan Anderson', 'Mia Thomas', 'James Taylor', 'Charlotte Lee'];
const cities = ['Boston', 'New York', 'Los Angeles', 'Chicago', 'Austin', 'Portland', 'Denver', 'Miami', 'Seattle', 'Nashville'];
const states = ['MA', 'NY', 'CA', 'IL', 'TX', 'OR', 'CO', 'FL', 'WA', 'TN'];
const streets = ['123 Oak St', '456 Maple Ave', '789 Pine Rd', '321 Elm Dr', '654 Cedar Ln', '987 Birch Way', '147 Walnut Ct', '258 Cherry Pl', '369 Spruce Blvd', '741 Willow St'];
const captions = ['Best Day Ever!', 'Summer 2025', 'Family Reunion', 'NYC Trip', 'Love You!', '', '', 'Graduation Day', 'Beach Vibes', '', 'Friendsgiving', 'Birthday Bash'];
const frames = ['normal', 'vintage', 'bw-vintage'] as const;
const statuses = ['processing', 'printed', 'shipped', 'delivered'] as const;

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMockOrders(count: number): CompletedOrder[] {
  const orders: CompletedOrder[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - count);

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    date.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

    const qty = [1, 1, 2, 3, 3, 5, 5, 7, 10][Math.floor(Math.random() * 9)];
    const isSelf = qty <= 2 && Math.random() > 0.3;
    const frame = randomFrom(frames);
    const caption = Math.random() > 0.4 ? randomFrom(captions.filter(c => c)) : '';
    const unitPrice = qty >= 5 ? 4.99 : qty >= 3 ? 5.99 : 6.99;

    const idx = Math.floor(Math.random() * cities.length);
    const address = {
      fullName: randomFrom(names),
      address1: randomFrom(streets),
      address2: '',
      city: cities[idx],
      state: states[idx],
      zip: `${10000 + Math.floor(Math.random() * 89999)}`,
    };

    const recipients = isSelf ? [] : Array.from({ length: qty }, (_, j) => ({
      id: `r-${i}-${j}`,
      address: {
        fullName: names[(i + j) % names.length],
        address1: streets[(i + j) % streets.length],
        address2: '',
        city: cities[(i + j) % cities.length],
        state: states[(i + j) % states.length],
        zip: `${10000 + Math.floor(Math.random() * 89999)}`,
      },
    }));

    orders.push({
      orderId: `MEM-${(10234 + i).toString().padStart(5, '0')}`,
      orderDate: date.toISOString(),
      email: `${randomFrom(names).toLowerCase().replace(' ', '.')}@email.com`,
      mode: isSelf ? 'self' : 'friends',
      quantity: qty,
      selectedFrame: frame,
      caption,
      croppedImage: '',
      selfAddress: isSelf ? address : null,
      recipients,
      unitPrice,
      totalPrice: +(unitPrice * qty).toFixed(2),
      status: randomFrom(statuses),
    });
  }

  return orders.reverse();
}

const ORDERS_KEY = 'memora-orders';

export function getOrders(): CompletedOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Seed mock data
  const mock = generateMockOrders(15);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(mock));
  return mock;
}

export function saveOrder(order: CompletedOrder) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}
