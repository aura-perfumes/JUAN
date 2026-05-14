export const Pagos = {
  openCheckout: step => window.openAuraCheckout?.(step),
  closeCheckout: () => window.closeAuraCheckout?.(),
  applyCoupon: () => window.applyCheckoutCoupon?.()
};
