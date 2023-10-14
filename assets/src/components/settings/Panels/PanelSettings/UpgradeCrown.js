import {__} from "@wordpress/i18n";

const UpgradeCrown = ( { classes, proBadge = true, proCrown = true } ) => {
    return (
        // Render upgrade to pro preview by using this component.
        <div className={ `sgsb-field-upgrade-pro-label ${ classes }` }>
            { proCrown && (
                <svg width='18' height='14' fill='none'>
                    <path
                        fill='#FFAC27'
                        d='M17.292 4.751c.003.05-.001.1-.013.15l-1.11 4.441c-.056.224-.256.381-.487.382l-6.662.034H2.355c-.232 0-.434-.158-.49-.383L.755 4.918c-.013-.051-.016-.103-.013-.154A1.06 1.06 0 0 1 0 3.753a1.06 1.06 0 0 1 1.06-1.06 1.06 1.06 0 0 1 1.06 1.06 1.06 1.06 0 0 1-.387.818l1.39 1.401c.351.354.839.557 1.338.557.59 0 1.152-.28 1.506-.749l2.284-3.027c-.192-.192-.311-.457-.311-.749A1.06 1.06 0 0 1 9 .943a1.06 1.06 0 0 1 1.06 1.06c0 .283-.112.541-.294.731l2.27 3.038c.354.474.918.757 1.51.757a1.87 1.87 0 0 0 1.333-.552l1.399-1.399a1.06 1.06 0 0 1 .664-1.885 1.06 1.06 0 0 1 .352 2.058zM16.06 11.34c0-.279-.226-.505-.505-.505H2.501c-.279 0-.505.226-.505.505v1.211c0 .279.226.505.505.505h13.054c.279 0 .505-.226.505-.505V11.34z'
                    />
                </svg>
            ) }
            { proBadge && (
                <span className='sgsb-pro-badge'>
                    { __( 'PRO', 'storegrowth-sales-booster' ) }
                </span>
            ) }
        </div>
    );
}

export default UpgradeCrown;
