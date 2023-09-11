const PanelContainer = ( { children, classes } ) => {
    return (
        // Render settings panel container.
        <div className={ `panel-container ${ classes }` }>
            { children }
        </div>
    );
}

export default PanelContainer;
