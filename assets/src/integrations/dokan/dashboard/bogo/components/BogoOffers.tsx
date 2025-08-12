import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// @ts-ignore
import { addQueryArgs } from '@wordpress/url';
// @ts-ignore
import apiFetch from '@wordpress/api-fetch';
import { ToggleSwitch, useToast } from '@getdokan/dokan-ui';
// @ts-ignore
import { DataViews, DokanModal, DokanLink, PriceHtml } from '@dokan/components';

const BogoOffers = ( { navigate, vendorId } ) => {
    const toast = useToast();
    const [ isLoading, setIsLoading ] = useState( true );
    const [ offersData, setOffersData ] = useState( [] );
    const [ currentOffer, setCurrentOffer ] = useState( null );
    const [ totalOffers, setTotalOffers ] = useState( 0 );
    const [ productIds, setProductIds ] = useState( [] );
    const [ productsMap, setProductsMap ] = useState( {} );
    const [ isConfirmationModalOpen, setIsConfirmationModalOpen ] =
        useState( false );

    // Get product name.
    const getProductName = ( productId ) => {
        if ( productId && productsMap[ productId ] && productsMap[ productId ].name ) {
            return productsMap[ productId ].name;
        }
        return '';
    }

    // Get product price.
    const getProductPrice = ( productId ) => {
        if ( productId && productsMap[ productId ] && productsMap[ productId ].price ) {
            return productsMap[ productId ].price;
        }
        return '';
    }

    // Get offer discounted amount.
    const getDiscountedAmount = ( item ) => {
        let discountedPrice = 0.00;
        let productId = 'same' === item?.bogo_deal_type ? item?.offered_products : item?.get_different_product_field;
        let product = productId ? productsMap[ productId ] : null;

        if ( 'discount' === item?.offer_type && product ) {
            discountedPrice = product.price - ( product.price * ( item?.discount_amount / 100 ) );
        }

        return discountedPrice;
    }

    // Handle orders fetching from the server.
    const fetchBogoOffers = async () => {
        setIsLoading( true );

        try {
            // Query arguments.
            const queryArgs = {
                per_page: view?.perPage ?? 10,
                page: view?.page ?? 1,
            };

            const response: Response = await apiFetch( {
                path: addQueryArgs(
                    `/sales-booster/v1/bogo/offers/vendor/${ vendorId }`,
                    {
                        ...queryArgs,
                    }
                ),
                method: 'GET',
                parse: false,
            } );

            const offers = await response.json();
            const totalItems = parseInt( response.headers.get( 'X-WP-Total' ) );

            setOffersData( offers );
            setTotalOffers( totalItems ); // Set total items count.

            // Include product IDs from offers.
            offers.forEach( offer => {
                if ( offer.offered_products ) {
                    const productId = offer.offered_products;
                    if ( ! productIds.includes( productId ) ) {
                        setProductIds( prevData => {
                            return [ ...prevData, productId ];
                        } );
                    }
                }

                if ( offer.get_different_product_field ) {
                    const productId = offer.get_different_product_field;
                    if ( ! productIds.includes( productId ) ) {
                        setProductIds( prevData => {
                            return [ ...prevData, productId ];
                        } );
                    }
                }
            } );
        } catch ( error ) {
            // Handling the case where `error` is a Response object
            if ( error instanceof Response ) {
                const errorData = await error.json().catch( () => null );

                if ( 'no_offer_items' === errorData?.code ) {
                    return;
                }

                toast( {
                    type: 'error',
                    title:
                        __( 'Error fetching BOGO offers: ', 'storegrowth-sales-booster-pro' ) +
                        ( errorData?.message ||
                            error.statusText ||
                            __( 'Unknown error', 'storegrowth-sales-booster-pro' ) ),
                } );
            } else {
                toast( {
                    type: 'error',
                    title: __( 'Error fetching BOGO offers: ', 'storegrowth-sales-booster-pro' ) + error,
                } );
            }
        } finally {
            setIsLoading( false );
        }
    };

    // Handle offer status change.
    const handleStatusChange = async ( checked, item ) => {
        setIsLoading( true );

        try {
            // Query arguments.
            const queryArgs = {
                bogo_status: checked ? 'yes' : 'no',
                name_of_order_bogo: item?.name_of_order_bogo,
                offer_type: item?.offer_type,
                offered_products: item?.offered_products,
                get_different_product_field: item?.get_different_product_field,
            };

            const updatedItem = await apiFetch( {
                path: addQueryArgs(
                    `/sales-booster/v1/bogo/vendor-offers/${ item?.id }`,
                    {
                        ...queryArgs,
                    }
                ),
                method: 'POST',
            } );

            if ( updatedItem ) {
                toast( {
                    type: 'success',
                    title: __( 'BOGO offer status updated successfully.', 'storegrowth-sales-booster-pro' ),
                } );
            }

            await fetchBogoOffers();
        } catch ( error ) {
            toast( {
                type: 'error',
                title: __( 'Error updating BOGO offer status: ', 'storegrowth-sales-booster-pro' ) + error.error,
            } );
        } finally {
            setIsLoading( false );
        }
    };

    // Handle delete offer confirmation.
    const handleOfferDeletion = ( item ) => {
        setCurrentOffer( item );
        setIsConfirmationModalOpen( true );
    };

    // Handle delete offer.
    const deleteOffer = async () => {
        if ( ! currentOffer ) {
            return;
        }

        setIsLoading( true );

        try {
            const deletedItem = await apiFetch( {
                path: `/sales-booster/v1/bogo/vendor-offers/${ currentOffer?.id }`,
                method: 'DELETE',
            } );

            if ( deletedItem ) {
                toast( {
                    type: 'success',
                    title: __( 'BOGO offer deleted successfully.', 'storegrowth-sales-booster-pro' ),
                } );
            }

            await fetchBogoOffers();
        } catch ( error ) {
            toast( {
                type: 'error',
                title: __( 'Error deleting BOGO offer: ', 'storegrowth-sales-booster-pro' ) + error.error,
            } );
        } finally {
            setIsLoading( false );
            setIsConfirmationModalOpen( false );
        }
    };

    // Fields for handle the table columns.
    const fields = [
        {
            id: 'name_of_order_bogo',
            label: __( 'Offer Name', 'storegrowth-sales-booster-pro' ),
            render: ( { item } ) => (
                <div>
                    { isLoading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <DokanLink
                            as="div"
                            onClick={ () => {
                                navigate( `/sales-booster/bogo/update/${ item.id }` );
                            } }
                            className="font-bold cursor-pointer"
                        >
                            { item.name_of_order_bogo }
                        </DokanLink>
                    ) }
                </div>
            ),
            enableSorting: false,
            enableGlobalSearch: false,
        },
        {
            id: 'bogo_status',
            label: __( 'Status', 'storegrowth-sales-booster-pro' ),
            render: ( { item } ) => (
                <div>
                    { isLoading ? (
                        <span className="block w-10 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <ToggleSwitch
                            checked={ 'yes' === item.bogo_status }
                            onChange={ (status) => handleStatusChange( status, item ) }
                        />
                    ) }


                </div>
            ),
            enableSorting: false,
            enableGlobalSearch: false,
        },
        {
            id: 'offered_products',
            label: __( 'Target Product', 'storegrowth-sales-booster-pro' ),
            render: ( { item } ) => (
                <div>
                    { isLoading ? (
                        <span className="block w-20 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <span><strong>{ getProductName( item?.offered_products ) }</strong></span>
                    ) }
                </div>
            ),
            enableSorting: false,
            enableGlobalSearch: false,
        },
        {
            id: 'offers',
            label: __( 'Offers', 'storegrowth-sales-booster-pro' ),
            render: ( { item } ) => (
                <div>
                    { isLoading ? (
                            <>
                                <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
                                <span className="block w-20 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
                                <span className="block w-16 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
                                <span className="block w-28 h-3 rounded bg-gray-200 animate-pulse mb-2"></span>
                                <span className="block w-16 h-3 rounded bg-gray-200 animate-pulse"></span>
                            </>
                    ) : (
                        <ul>
                            <li><strong>{ getProductName( item?.get_different_product_field ? item.get_different_product_field : item?.offered_products ) }</strong></li>
                            <li>{ __( 'Product Price: ', 'storegrowth-sales-booster-pro' ) } <PriceHtml price={ getProductPrice( item?.get_different_product_field ? item.get_different_product_field : item?.offered_products ) } /></li>
                            <li>{ __( 'Discounted Price: ', 'storegrowth-sales-booster-pro' ) } <PriceHtml price={ getDiscountedAmount( item ) } /></li>
                        </ul>
                    ) }
                </div>
            ),
            enableSorting: false,
            enableGlobalSearch: false,
        },
    ];

    // Necessary actions for the table rows.
    const actions = [
        {
            id: 'offer-edit',
            label: '',
            isPrimary: true,
            isEligible: ( item ) => !! item.id,
            callback: ( offers ) => {
                const offer = offers[ 0 ];
                navigate( `/sales-booster/bogo/update/${ offer.id }` );
            },
            icon: () => (
                <span
                    className={ `px-2 bg-transparent font-medium text-dokan-link hover:text-dokan-link-hover pr-r text-sm` }
                >
                    { __( 'Edit', 'storegrowth-sales-booster-pro' ) }
                </span>
            ),
        },
        {
            id: 'offer-delete',
            label: '',
            isPrimary: true,
            isEligible: ( item ) => !! item.id,
            icon: () => {
                return (
                    <span
                        className={ `px-2 bg-transparent font-medium text-dokan-danger hover:text-dokan-danger-hover text-sm` }
                    >
                        { __( 'Delete', 'storegrowth-sales-booster-pro' ) }
                    </span>
                );
            },
            callback: ( offers ) => {
                handleOfferDeletion( offers[ 0 ] );
            },
        },
    ];

    // Data view default layout.
    const defaultLayouts = {
        table: {},
        grid: {},
        list: {},
        density: 'comfortable', // Use density pre-defined values: comfortable, compact, cozy
    };

    // View state for handle the table view.
    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        type: 'table',
        titleField: 'id',
        status: 'completed,failed,cancelled',
        layout: { ...defaultLayouts },
        fields: fields.map( ( field ) =>
            field.id !== 'id' ? field.id : ''
        ),
    } );

    // Fetch offers when view changes.
    useEffect( () => {
        if ( ! vendorId ) {
            return;
        }

        fetchBogoOffers();
    }, [ vendorId, view ] );

    // Fetch products data when product IDs change.
    useEffect( () => {
        productIds.forEach( async ( productId ) => {
            if ( ! productsMap[ productId ] ) {
                let product = await apiFetch( {
                    path: `/dokan/v1/products/${ productId }`,
                    method: 'GET',
                } );

                setProductsMap( prevMap => ( {
                    ...prevMap,
                    [ productId ]: product,
                } ) );
            }
        } );
    }, [ productIds ] );

    return (
        <>
            <DataViews
                data={ offersData }
                namespace="dokan-vendor-subscription-orders-data-view"
                defaultLayouts={ { ...defaultLayouts } }
                fields={ fields }
                getItemId={ ( item ) => item.id }
                onChangeView={ setView }
                search={ false }
                paginationInfo={ {
                    // Pagination data for the table.
                    totalItems: totalOffers,
                    totalPages: Math.ceil( totalOffers / view.perPage ),
                } }
                view={ view }
                actions={ actions }
                isLoading={ isLoading }
                topPanel={ false }
            />

            <DokanModal
                isOpen={ isConfirmationModalOpen }
                namespace="storegrowth-dokan-vendor-bogo-offer-delete"
                dialogTitle={ __( 'Delete Offer', 'storegrowth-sales-booster-pro' ) }
                confirmationTitle={ __(
                    'Are you sure you want to proceed?',
                    'storegrowth-sales-booster-pro'
                ) }
                confirmationDescription={ __(
                    'Deleting this offer will prevent further completion of this subscription purchase.',
                    'storegrowth-sales-booster-pro'
                ) }
                confirmButtonText={ __( 'Yes, Delete', 'storegrowth-sales-booster-pro' ) }
                cancelButtonText={ __( 'Close', 'storegrowth-sales-booster-pro' ) }
                onConfirm={ () => deleteOffer() }
                onClose={ () => setIsConfirmationModalOpen( false ) }
            />
        </>
    );
};

export default BogoOffers;
