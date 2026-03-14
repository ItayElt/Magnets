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
  status: 'processing' | 'printed' | 'shipped' | 'delivered';
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
