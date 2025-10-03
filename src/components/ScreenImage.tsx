import React from 'react';

interface ScreenImageProps {
  src: string;
  alt: string;
  fadeClass: string;
}

const ScreenImage: React.FC<ScreenImageProps> = ({ src, alt, fadeClass }) => {
  return (
    <img
      className={fadeClass}
      id="screen-image"
      src={src}
      alt={alt}
      loading="lazy"
    />
  );
};

export default ScreenImage;
