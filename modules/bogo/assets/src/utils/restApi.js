import apiFetch from '@wordpress/api-fetch';

/**
 * REST API utility functions for BOGO module
 * 
 * @package SBFW
 */

const REST_BASE_URL = '/sales-booster/v1/bogo/offers';

/**
 * Make a REST API request using WordPress apiFetch
 * 
 * @param {string} endpoint - The endpoint to call
 * @param {Object} options - Request options
 * @returns {Promise} - Promise that resolves with the response
 */
const makeRestRequest = async (endpoint, options = {}) => {
    const url = `${REST_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        method: 'GET',
    };

    const requestOptions = {
        path: url,
        ...defaultOptions,
        ...options,
    };

    try {
        // Use WordPress apiFetch which automatically handles wp-json prefix and nonce
        const data = await apiFetch(requestOptions);
        
        return data;
    } catch (error) {
        console.error('REST API request failed:', error);
        throw error;
    }
};

/**
 * Get all BOGO offers
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise that resolves with BOGO offers
 */
export const getBogoOffers = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return makeRestRequest(endpoint);
};

/**
 * Get a single BOGO offer by ID
 * 
 * @param {number} id - BOGO offer ID
 * @returns {Promise} - Promise that resolves with BOGO offer
 */
export const getBogoOffer = async (id) => {
    return makeRestRequest(`/${id}`);
};

/**
 * Create a new BOGO offer
 * 
 * @param {Object} data - BOGO offer data
 * @returns {Promise} - Promise that resolves with created BOGO offer
 */
export const createBogoOffer = async (data) => {
    return makeRestRequest('', {
        method: 'POST',
        data: data,
    });
};

/**
 * Update an existing BOGO offer
 * 
 * @param {number} id - BOGO offer ID
 * @param {Object} data - Updated BOGO offer data
 * @returns {Promise} - Promise that resolves with updated BOGO offer
 */
export const updateBogoOffer = async (id, data) => {
    return makeRestRequest(`/${id}`, {
        method: 'PUT',
        data: data,
    });
};

/**
 * Delete a BOGO offer
 * 
 * @param {number} id - BOGO offer ID
 * @returns {Promise} - Promise that resolves with deletion status
 */
export const deleteBogoOffer = async (id) => {
    return makeRestRequest(`/${id}`, {
        method: 'DELETE',
    });
};

/**
 * Update BOGO offer status
 * 
 * @param {number} id - BOGO offer ID
 * @param {string} status - New status ('yes' or 'no')
 * @returns {Promise} - Promise that resolves with updated status
 */
export const updateBogoStatus = async (id, status) => {
    return makeRestRequest(`/${id}/status`, {
        method: 'PUT',
        data: { status },
    });
};

/**
 * Legacy Ajax compatibility wrapper for gradual migration
 * 
 * @param {string} action - Ajax action name
 * @param {Object} data - Request data
 * @param {Function} callback - Success callback
 * @param {Function} errorCallback - Error callback
 */
export const legacyAjaxWrapper = (action, data, callback, errorCallback) => {
    // Map Ajax actions to REST API calls
    const actionMap = {
        'bogo_list': () => {
            if (data && typeof data === 'number') {
                return getBogoOffer(data);
            }
            return getBogoOffers();
        },
        'bogo_create': () => createBogoOffer(data),
        'bogo_delete': () => deleteBogoOffer(data),
        'bogo_status_handler': () => updateBogoStatus(data.id, data.status ? 'yes' : 'no'),
    };

    const restCall = actionMap[action];
    
    if (restCall) {
        restCall()
            .then((response) => {
                // Format response to match Ajax structure
                const formattedResponse = {
                    success: true,
                    data: response,
                };
                callback(formattedResponse);
            })
            .catch((error) => {
                const errorResponse = {
                    success: false,
                    data: error.message,
                };
                if (errorCallback) {
                    errorCallback(errorResponse);
                } else {
                    callback(errorResponse);
                }
            });
    } else {
        // Fallback to original Ajax for unsupported actions
        jQuery.post(
            window.bogo_save_url?.ajax_url,
            {
                action: action,
                data: data,
                _ajax_nonce: window.bogo_save_url?.ajd_nonce,
            },
            callback
        );
    }
};
