export {}

declare global {
  interface Window {
    GammalTech?: {
      login: () => Promise<void>
      isLoggedIn: () => boolean
      payCard: (
        amount: number,
        currency: string,
        description: string,
        onDelivery: (delivery: { txn: string; amount: number; description: string }) => void
      ) => Promise<{ success: boolean; txn: string; amount: number; delivered_at: string }>
      payment: {
        settlePending: () => Promise<{ has_pending: boolean; payment_token?: string; description?: string; amount?: number }>
        verifyPayment: (arg: null, token: string) => Promise<{ valid: boolean; txn: string; amount: number; description: string }>
        confirmDelivery: () => Promise<void>
      }
    }
  }
}
