/**
 * Currency formatting utility for Pakistani Rupees (PKR).
 * Use this everywhere instead of hardcoding Rs / $ / PKR.
 */

/**
 * Format a number as Pakistani Rupees.
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted string like "Rs 1,500"
 */
export function formatCurrency(amount) {
    const num = Number(amount);
    if (isNaN(num)) return 'Rs 0';
    return `Rs ${num.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format with decimals (for shop products).
 * @param {number|string} amount
 * @returns {string} Formatted string like "Rs 1,499.99"
 */
export function formatCurrencyDecimal(amount) {
    const num = Number(amount);
    if (isNaN(num)) return 'Rs 0.00';
    return `Rs ${num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default formatCurrency;
