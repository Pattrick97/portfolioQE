// Deterministic data — static inputs and assertion strings for cart/payment domain

export interface ProductFilters {
  mainCategory: string;
  subCategory: string;
  brand: string;
}

export const guestCartCategoryFilter: ProductFilters = {
  mainCategory: "Women",
  subCategory: "Dress",
  brand: "Polo",
};

export const cartStaticData = {
  orderComment: "Please deliver during working hours.",
  payment: {
    cardNumber: "4242424242424242",
    cvc: "123",
    expiryMonth: "12",
    expiryYear: "2030",
  },
} as const;

export const cartMessages = {
  orderPlaced: "Order Placed!",
} as const;
