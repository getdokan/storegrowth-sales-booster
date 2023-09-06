const PanelContainer = ( { children } ) => {
    return (
        // Render settings panel container.
        <div className={ `panel-container` }>
            { children }
        </div>
    );
}

export default PanelContainer;
