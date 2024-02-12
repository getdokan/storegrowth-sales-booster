import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { ReactComponent as CountdownIcon } from '../../images/countdown-timer.svg'; // Import SVG icon correctly


// Register your block type
registerBlockType(
  metadata.name,
  {
    title: "Sales Countdown",
    category: "sales-booster", // Assign the category to your block
    icon: <CountdownIcon />, // Use the SVG icon directly
    edit: Edit,
    save,
  }
);
