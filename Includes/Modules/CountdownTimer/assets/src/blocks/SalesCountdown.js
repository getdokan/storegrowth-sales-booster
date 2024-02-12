import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

import { ReactComponent as CountdownIcon } from '../../images/countdown-timer.svg'; // Import SVG icon correctly

registerBlockType(
  metadata.name,
  {
    title: "Sales Countdown",
    icon: <CountdownIcon />, // Use the SVG icon directly
    /**
     * @see ./edit.js
     */
    edit: Edit,
    /**
     * @see ./save.js
     */
    save,
  }
);
