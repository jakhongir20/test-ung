import { useState, useEffect } from 'react';

const BACKGROUND_IMAGES = [
  '/bg/random/01.jpg',
  '/bg/random/02.jpg',
  '/bg/random/03.jpg',
  '/bg/random/04.jpg',
  '/bg/random/05.jpg',
  '/bg/random/06.jpg',
  '/bg/random/07.jpg',
  '/bg/random/08.jpg',
];

export const useRandomBackground = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  useEffect(() => {
    // Select a random background image
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex]);
  }, []);

  return {
    backgroundImage,
    backgroundStyle: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    },
    mobileBackgroundStyle: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'scroll', // Changed to scroll for mobile performance
    }
  };
};
