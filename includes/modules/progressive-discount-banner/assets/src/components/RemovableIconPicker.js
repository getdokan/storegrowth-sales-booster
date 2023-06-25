import { IconPicker } from "react-fa-icon-picker";
const noop = () => {};

export const RemovableIconPicker = (props) => {
  const { onClear = noop } = props;
  return (
    <div className="sgsb-removable-icon-picker-wrapper">
      <span
        className="clear-icon"
        style={{
          cursor: "pointer",
        }}
        onClick={onClear}
      >
        x
      </span>
      <IconPicker {...props} />
    </div>
  );
};
