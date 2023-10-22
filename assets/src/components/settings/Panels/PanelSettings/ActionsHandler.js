import { Button } from 'antd';
import { __ } from '@wordpress/i18n';

const ActionsHandler = ( { resetHandler, saveHandler, loadingHandler, isDisabled } ) => {
    return (
        <div className={ `sgsb-settings-actions` }>
            <Button
                htmlType  = 'reset'
                type      = 'secondary'
                disabled  = { isDisabled }
                onClick   = { resetHandler }
                className = 'sgsb-settings-reset-button'
            >
                { __( 'Reset', 'storegrowth-sales-booster' ) }
            </Button>
            <Button
                htmlType  = 'submit'
                type      = 'primary'
                disabled  = { isDisabled }
                onClick   = { saveHandler }
                loading   = { loadingHandler }
                className = 'sgsb-settings-save-button'
            >
                { __( 'Save', 'storegrowth-sales-booster' ) }
            </Button>
        </div>
    );
}

export default ActionsHandler;
