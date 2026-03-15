// Expanded status type
export type OrderStatus = 'paid' | 'processing' | 'sent_to_print' | 'printed' | 'shipped' | 'delivered';

export interface Address {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface Recipient {
  id: string;
  address: Address;
}

export type PhotoStyle = 'normal' | 'vintage' | 'bw-vintage';

/** @deprecated Use PhotoStyle instead */
export type FrameStyle = PhotoStyle;

export type RecipientMode = 'self' | 'friends';

export interface OrderState {
  // Step 1: Upload
  originalImage: string | null;
  originalDimensions: { w: number; h: number } | null;

  // Step 2: Crop
  croppedImage: string | null;
  cropArea: { x: number; y: number; width: number; height: number } | null;
  lowResolution: boolean;

  // Step 3: Customize
  selectedFrame: FrameStyle;
  caption: string;

  // Step 4: Recipients
  mode: RecipientMode;
  quantity: number;
  selfAddress: Address | null;
  recipients: Recipient[];

  // Step 5: Checkout
  email: string;

  // Step 6: Confirmation
  orderId: string | null;
  orderDate: string | null;
}

export interface CompletedOrder {
  orderId: string;
  orderDate: string;
  email: string;
  mode: RecipientMode;
  quantity: number;
  selectedFrame: FrameStyle;
  caption: string;
  croppedImage: string;
  selfAddress: Address | null;
  recipients: Recipient[];
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
}

export type OrderAction =
  | { type: 'SET_ORIGINAL_IMAGE'; payload: { image: string; dimensions: { w: number; h: number } } }
  | { type: 'SET_CROPPED_IMAGE'; payload: { image: string; cropArea: { x: number; y: number; width: number; height: number }; lowResolution: boolean } }
  | { type: 'SET_FRAME'; payload: FrameStyle }
  | { type: 'SET_CAPTION'; payload: string }
  | { type: 'SET_MODE'; payload: RecipientMode }
  | { type: 'SET_QUANTITY'; payload: number }
  | { type: 'SET_SELF_ADDRESS'; payload: Address }
  | { type: 'ADD_RECIPIENT'; payload: Recipient }
  | { type: 'REMOVE_RECIPIENT'; payload: string }
  | { type: 'UPDATE_RECIPIENT'; payload: Recipient }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'COMPLETE_ORDER'; payload: { orderId: string; orderDate: string } }
  | { type: 'RESET' };

// Database types
export interface DbOrder {
  id: string;
  order_id: string;
  created_at: string;
  email: string;
  mode: RecipientMode;
  quantity: number;
  photo_style: string;
  caption: string;
  image_path: string | null;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  batch_id: string | null;
  status_updated_at: string;
  notes: string;
  tracking_number: string | null;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  recipient_name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  quantity: number;
  created_at: string;
}

export interface DbStatusLog {
  id: string;
  order_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  note: string;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  resolved: boolean;
}
