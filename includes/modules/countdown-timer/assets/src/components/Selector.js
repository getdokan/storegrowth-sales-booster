function Selector({ option, onSelect, isSelected }) {
  return (
    <div
      className={`selector ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(option)}
    >
      <div className={`image-wrapper ${isSelected ? "bordered" : ""}`}>
        {option.image && <img src={option.image} alt={option.label} />}
        {option.svg && <div dangerouslySetInnerHTML={{ __html: option.svg }} />}
      </div>
      <p>{option.label}</p>
    </div>
  );
}

export default Selector;
