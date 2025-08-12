import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { AsyncSearchableSelect } from '@getdokan/dokan-ui';

const ProductSearch = ( { name, label, onChange, value = {}, placeholder = '', required = false, isMulti = false, disabled = false, clearable = true, errors = [] } ) => {
    const [ options, setOptions ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ searchedProducts, setSearchedProducts ] =
        useState( [] );

    let debounceTimer;
    const debounced = ( { inputValue, callback }) => {
        clearTimeout( debounceTimer );
        debounceTimer = setTimeout(async () => {
            try {
                const searchResults = await fetchProducts(inputValue);
                const resultData = searchResults.map((product) => ({
                    label: `#${product.id} ${product.name}`,
                    value: product.id,
                }));

                setSearchedProducts(resultData);
                callback(resultData);
            } catch (error) {
                console.error(__('Search failed:', 'storegrowth-sales-booster' ), error);
            }
        }, 300 ); // adjust delay as needed
    };


    const fetchProducts = useCallback( async (search) => {
        setIsLoading(true);
        try {
            const products = await apiFetch({
                path: `/dokan/v2/products?search=${encodeURIComponent(search)}&per_page=20`,
            });

            const formattedProducts = [];

            products.forEach((product) => {
                if (product.name && product.id) {
                    formattedProducts.push({
                        label: product.name,
                        value: product.id,
                    });
                }
            });

            setOptions(formattedProducts);

            return products;
        } catch (e) {
            setOptions([]);
            return []; // Return empty array on error
        } finally {
            setIsLoading(false);
        }
    }, [] );


    return (
        <AsyncSearchableSelect
            name={ name }
            label={ label }
            className=""
            defaultOptions={ searchedProducts }
            placeholder={ placeholder }
            errors={ errors }
            onChange={ onChange }
            isMulti={ isMulti }
            loadOptions={ (
                inputValue: string,
                callback: (
                    options: {
                        label: string;
                        value: string;
                    }[]
                ) => void
            ) => {
                debounced( {
                    inputValue,
                    callback,
                } );
            } }
            noOptionsMessage={ () =>
                __( 'No Options', 'storegrowth-sales-booster' )
            }
            disabled={ disabled }
            required={ required }
            value={value}
            isClearable={ clearable }
        />
    );
};

export default ProductSearch;
