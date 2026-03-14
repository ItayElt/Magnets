import { CompletedOrder } from '../types';

export function generateOrderCSV(orders: CompletedOrder[]): string {
  const header = 'filename,full_name,address1,address2,city,state,zip';
  const rows: string[] = [header];

  for (const order of orders) {
    if (order.mode === 'self' && order.selfAddress) {
      const a = order.selfAddress;
      for (let i = 1; i <= order.quantity; i++) {
        rows.push(
          `${order.orderId}_${i}.jpg,${a.fullName},${a.address1},${a.address2},${a.city},${a.state},${a.zip}`
        );
      }
    } else {
      order.recipients.forEach((r, idx) => {
        const a = r.address;
        rows.push(
          `${order.orderId}_${idx + 1}.jpg,${a.fullName},${a.address1},${a.address2},${a.city},${a.state},${a.zip}`
        );
      });
    }
  }

  return rows.join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
