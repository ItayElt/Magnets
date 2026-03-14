'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { OrderState, OrderAction } from '../types';

const initialState: OrderState = {
  originalImage: null,
  originalDimensions: null,
  croppedImage: null,
  cropArea: null,
  lowResolution: false,
  selectedFrame: 'minimal-polaroid',
  caption: '',
  mode: 'self',
  quantity: 1,
  selfAddress: null,
  recipients: [],
  email: '',
  orderId: null,
  orderDate: null,
};

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'SET_ORIGINAL_IMAGE':
      return {
        ...state,
        originalImage: action.payload.image,
        originalDimensions: action.payload.dimensions,
        croppedImage: null,
        cropArea: null,
      };
    case 'SET_CROPPED_IMAGE':
      return {
        ...state,
        croppedImage: action.payload.image,
        cropArea: action.payload.cropArea,
        lowResolution: action.payload.lowResolution,
      };
    case 'SET_FRAME':
      return { ...state, selectedFrame: action.payload };
    case 'SET_CAPTION':
      return { ...state, caption: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_QUANTITY':
      return { ...state, quantity: Math.max(1, action.payload) };
    case 'SET_SELF_ADDRESS':
      return { ...state, selfAddress: action.payload };
    case 'ADD_RECIPIENT':
      return {
        ...state,
        recipients: [...state.recipients, action.payload],
        quantity: state.recipients.length + 1,
      };
    case 'REMOVE_RECIPIENT':
      const filtered = state.recipients.filter(r => r.id !== action.payload);
      return {
        ...state,
        recipients: filtered,
        quantity: Math.max(1, filtered.length),
      };
    case 'UPDATE_RECIPIENT':
      return {
        ...state,
        recipients: state.recipients.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'COMPLETE_ORDER':
      return {
        ...state,
        orderId: action.payload.orderId,
        orderDate: action.payload.orderDate,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const STORAGE_KEY = 'memora-order-state';

function loadState(): OrderState {
  if (typeof window === 'undefined') return initialState;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed };
    }
  } catch {}
  return initialState;
}

function saveState(state: OrderState) {
  try {
    // Don't persist blob URLs (they expire across sessions)
    const toSave = { ...state, originalImage: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

interface OrderContextValue {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState, () => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
