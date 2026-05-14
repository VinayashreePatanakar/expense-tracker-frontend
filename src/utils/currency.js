// utils/currency.js
export const getCurrencySymbol = (currency) => {
  switch (currency) {
    case "USD":
      return "$";
    case "INR":
      return "₹";
    default:
      return "₹";
  }
};

export const formatCurrency = (amount, currency) => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount}`;
};