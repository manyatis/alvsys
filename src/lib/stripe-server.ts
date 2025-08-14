import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

// Function to get or create Stripe instance (only called at runtime)
export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    });
  }
  
  return stripeInstance;
};