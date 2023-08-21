import { Image } from "antd";
function Selector({ option, onSelect, isSelected }) {
  return (
    <div
      className={`selector ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(option)}
    >
      <div className={`image-wrapper ${isSelected ? "bordered" : ""}`}>
        {option.image && <img src={option.image} alt={option.label} />}
        {option.svg && (
          <Image
            className="box-icon"
            preview={false} 
            src={option.svg}
          />
        )}
      </div>
    </div>
  );
}

export default Selector;
