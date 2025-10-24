import {useState} from "@wordpress/element";
import apiFetch from '@wordpress/api-fetch';
import SelectBox from "./SelectBox";


const ProductAsyncSelect = (props) => {
    const {changeHandler, fieldValue, name, title, placeHolderText, tooltip, queryArgs, colSpan = 24} = props
    const [products, setProducts] = useState([])

    const debounce = (func, delay) => {
        let timeoutId; // This will store the timer ID
        return function (...args) { // Returns a new function that will be debounced
            const context = this; // Preserve the 'this' context

            clearTimeout(timeoutId); // Clear any previous timer

            timeoutId = setTimeout(() => { // Set a new timer
                func.apply(context, args); // Execute the original function after the delay
            }, delay);
        };
    }

    const getProducts = async (args) => {
        const query = new URLSearchParams({
            search: args.search || '',
            product_type: args.product_type || '',
            per_page: args.per_page || 30
        })
        return await apiFetch({
            path: `/sales-booster/v1/products?${query.toString()}`,
        });
    }

    const onProductSearch = debounce(async (value = '') => {
        const response = await getProducts({
            search: value,
            ...queryArgs,
        });
        const products = response.map(product => {
            return {
                ...product,
                label: product.name,
                value: product.id,
            }
        })
        setProducts(products)
    }, 500);

    const fieldChangeHandler = (key, value) => {
        const product = products.find(item => parseInt(item.value) === parseInt(value))
        changeHandler(key, value, product)
    }


    return (
        <SelectBox
            name={name}
            title={title}
            tooltip={tooltip}
            colSpan={colSpan}
            showSearch={true}
            fieldWidth="100%"
            options={products}
            fieldValue={fieldValue}
            placeHolderText={placeHolderText}
            classes={`search-single-select`}
            changeHandler={fieldChangeHandler}
            filterOption={(inputValue, option) =>
                option?.children?.[0]
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes(inputValue.toLowerCase())
            }
            onSearch={onProductSearch}
            onOpenChange={() => {
                if (!products.length) {
                    onProductSearch();
                }
            }}
        />
    )
}

export default ProductAsyncSelect;
