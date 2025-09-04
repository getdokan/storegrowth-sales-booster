/**
 * Order Bump API Service for REST API calls.
 */

class OrderBumpApi {
    constructor() {
        this.namespace = 'spsg/v1';
        this.restBase = 'order-bumps';
        this.baseUrl = `${window.wpApiSettings?.root || '/wp-json/'}${this.namespace}/${this.restBase}`;
    }

    /**
     * Get all order bumps.
     *
     * @param {Object} params Query parameters.
     * @returns {Promise} Promise that resolves to the response.
     */
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Get a single order bump by ID.
     *
     * @param {number} id Order bump ID.
     * @returns {Promise} Promise that resolves to the response.
     */
    async getById(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Create a new order bump.
     *
     * @param {Object} data Order bump data.
     * @returns {Promise} Promise that resolves to the response.
     */
    async create(data) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Update an existing order bump.
     *
     * @param {number} id Order bump ID.
     * @param {Object} data Order bump data.
     * @returns {Promise} Promise that resolves to the response.
     */
    async update(id, data) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Delete an order bump.
     *
     * @param {number} id Order bump ID.
     * @returns {Promise} Promise that resolves to the response.
     */
    async delete(id) {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.ok;
    }

    /**
     * Get matching order bumps for cart products.
     *
     * @param {Array} cartProducts Array of product IDs in cart.
     * @param {Array} cartCategories Array of category IDs in cart.
     * @returns {Promise} Promise that resolves to the response.
     */
    async getMatchingBumps(cartProducts, cartCategories) {
        const params = new URLSearchParams({
            cart_products: JSON.stringify(cartProducts),
            cart_categories: JSON.stringify(cartCategories),
        });

        const response = await fetch(`${this.baseUrl}/matching?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || '',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

// Create and export a singleton instance
const orderBumpApi = new OrderBumpApi();
export default orderBumpApi;
