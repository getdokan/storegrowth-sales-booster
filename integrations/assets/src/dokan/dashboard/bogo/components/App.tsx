import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import BogoOffers from './BogoOffers';
import { DokanToaster } from '@getdokan/dokan-ui';

const App = ( { navigate } ) => {
    const [ vendorId, setVendorId ] = useState( 0 );

    const currentUser = useSelect( ( select ) => {
        return select( 'dokan/core' ).getCurrentUser();
    }, [] );

    useEffect( () => {
        if ( ! currentUser || ! currentUser?.id ) {
            return;
        }

        setVendorId( currentUser?.id );
    }, [ currentUser ] );

    return (
        <div>
            <BogoOffers navigate={ navigate } vendorId={ vendorId } />

            <DokanToaster/>
        </div>
    );
};

export default App;