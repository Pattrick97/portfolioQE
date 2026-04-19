export const testMessages = {
  accountCreated: "Account Created!",
  accountDeleted: "Account Deleted!",
  invalidLogin: "Your email or password is incorrect!",
  contactSuccess: "Success! Your details have been submitted successfully.",
  orderPlaced: "Order Placed!",
} as const;

export const testCheckoutData = {
  orderComment: "Please deliver during working hours.",
  payment: {
    cardNumber: "4242424242424242",
    cvc: "123",
    expiryMonth: "12",
    expiryYear: "2030",
  },
} as const;

export const testContactUsData = {
  invalidEmail: "invalid-email-format",
  uploadFilePath: "README.md",
} as const;
