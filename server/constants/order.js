const PAYMENT_METHODS = {
    CRYPTO: 'crypto',
    STRIPE: 'stripe',
};

const ORDER_STATUS = {
    PENDING: 'pending',
    WAITING: 'waiting',
    CONFIRMING: 'confirming',
    CONFIRMED: 'confirmed',
    SENDING: 'sending',
    PARTTIALLY_PAID: 'partially_paid',
    FINSIHED: 'finished',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    EXPIRED: 'expired',
}


module.exports = { PAYMENT_METHODS, ORDER_STATUS };