import {useState} from "react";

const TouchPreview = ( { children, previewWidth } ) => {
    const [ show, setShow ] = useState( false );

    return (
        <div className={ `touch-preview-panel` }>
            <div className={ `touch-preview-container` }>
                <div className={ `preview-button` } onClick={ () => setShow( !show ) }>
                    { show ? (
                        <svg style={ { width: 20 } } fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#fff">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#fff" style={ { width: 20 } }>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    ) }
                </div>
                <div
                    className={ `touch-preview` }
                    style={ { display: show ? 'block' : 'none', width: previewWidth ? previewWidth : 450 } }
                >
                    { children }
                </div>
            </div>
        </div>
    );
}

export default TouchPreview;
