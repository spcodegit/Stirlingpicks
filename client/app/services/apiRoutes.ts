export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        FORGOT: '/auth/forgot',
        VERIFY_EMAIL: '/auth/verify',
        ME: '/auth/me',
        ADMIN_COUNTERS: '/auth/admin/counters',
        USERS: '/auth/users',
        UPDATE: '/auth/update',
        CHANGE_PASSWORD: '/auth/password/change',
        ACCOUNT_CHANGE: '/auth/account/change',
    },
    BET: {
        SPORTS: '/bet/sports',
        ODDS_BY_SPORT: '/bet/odds-by-sport',
        PLACE: '/bet',
        ALL: '/bet/all',
        BY_ID: '/bet',
    },
    PAYMENT: {
        SELECTED_CURRENCIES: '/nowpayment/selected-currencies',
        ALL_CURRENCIES: '/nowpayment/all-currencies',
        CREATE_PAYMENT: '/nowpayment/create-payment',
        PAYMENT_STATUS: '/nowpayment/payment/status',
        WEBHOOK: '/nowpayment/webhook',
    },
    ORDER: {
        ALL: '/order/all',
        BY_ID: '/order',
    },
    FAQ: {
        ALL: '/faq',
        CREATE: '/faq',
        BY_ID: '/faq',
    },
    PAYOUT: {
        CREATE: '/payout',
        ALL: '/payout',
        BY_ID: '/payout',
        UPDATE: '/payout',
        DELETE: '/payout',
    },
    SUPPORT: {
        CREATE: '/support',
        ALL: '/support',
        BY_ID: '/support',
        UPDATE: '/support',
        DELETE: '/support',
    },
    PLAN: {
        CREATE: '/plan',
        ALL: '/plan',
        BY_ID: '/plan',
        UPDATE: '/plan',
        DELETE: '/plan',
    },
    PLAN_LOGS: {
        ALL: '/plan-logs/all',
    },
    CURRENCY: {
        FRANKFURTER_LATEST: 'https://api.frankfurter.app/latest',
        FALLBACK_LATEST: 'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
    },
};

