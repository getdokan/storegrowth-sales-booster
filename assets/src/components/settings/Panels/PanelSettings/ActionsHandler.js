import { Button } from 'antd';
import { __ } from '@wordpress/i18n';

const ActionsHandler = ( { resetHandler, saveHandler, loadingHandler, isDisabled } ) => {
    return (
        <div className={ `spsg-settings-actions` }>
            <Button
                htmlType  = 'reset'
                type      = 'secondary'
                disabled  = { isDisabled }
                onClick   = { resetHandler }
                className = 'spsg-settings-reset-button'
            >
                { __( 'Reset', 'storegrowth-sales-booster' ) }
            </Button>
            <Button
                htmlType  = 'submit'
                type      = 'primary'
                disabled  = { isDisabled }
                onClick   = { saveHandler }
                loading   = { loadingHandler }
                className = 'spsg-settings-save-button'
            >
                { __( 'Save', 'storegrowth-sales-booster' ) }
            </Button>
        </div>
    );
}

export default ActionsHandler;
