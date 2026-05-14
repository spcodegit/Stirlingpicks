const BANK_ACCOUNT_TYPES = {
    CHECKING: 'checking', // US (Current in UK)
    CURRENT: 'current', // UK (Checking in US)
    SAVINGS: 'savings',
    MONEY_MARKET: 'money_market',
    FIXED_DEPOSIT: 'fixed_deposit', // CD in US, Fixed Rate in UK
    CD: 'certificate_of_deposit',
    HIGH_YIELD_SAVINGS: 'high_yield_savings',
    BUSINESS: 'business',
    STUDENT: 'student',
    JOINT: 'joint',
    FOREIGN_CURRENCY: 'foreign_currency',
    BASIC: 'basic', // UK basic account
    ISA: 'isa', // UK tax-free account
    RETIREMENT_IRA: 'retirement_ira' // US retirement account
};

module.exports = { BANK_ACCOUNT_TYPES };