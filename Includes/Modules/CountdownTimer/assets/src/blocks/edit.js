import { __ } from "@wordpress/i18n";
import { useBlockProps } from "@wordpress/block-editor";
import SideBarController from "./SideBarController";
import CountDownOne from "./template/CountDownOne";
const Edit = ({ attributes, setAttributes }) => {
  
  const onFieldChange = (key, value) => {
    setAttributes({ ...attributes, [key]: value });
  };

  return (
    <div {...useBlockProps()}>
      <SideBarController
        attributes={attributes}
        setAttributes={setAttributes}
        onFieldChange={onFieldChange}
      />
      <CountDownOne  attributes={attributes}/>
    </div>
  );
};

export default Edit;
