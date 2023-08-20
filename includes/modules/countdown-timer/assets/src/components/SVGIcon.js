import React from 'react';

function SVGIcon({ src, alt, ...props }) {
  return <img src={src} alt={alt} {...props} />;
}

export default SVGIcon;
