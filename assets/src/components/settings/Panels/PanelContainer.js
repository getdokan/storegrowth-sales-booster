const PanelContainer = ( { children } ) => {
    return (
        // Render settings panel container.
        <div className={ `panel-container` }>
            { children }
        </div>
    );
}

window.SgsbPanelContainer = PanelContainer;

export default PanelContainer;
