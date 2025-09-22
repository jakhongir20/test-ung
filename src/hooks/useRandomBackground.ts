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

// Fallback background images in case random images fail
const FALLBACK_IMAGES = [
  '/bg/main-bg.png',
  '/bg/profile-bg.png',
  '/login_bg_image.png',
];

export const useRandomBackground = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadRandomBackground = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Select a random background image
        const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
        const selectedImage = BACKGROUND_IMAGES[randomIndex];
        
        // Test if the image can be loaded
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(selectedImage);
          setIsLoading(false);
        };
        img.onerror = () => {
          console.warn(`Failed to load random background: ${selectedImage}`);
          // Fallback to a default background
          const fallbackIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
          setBackgroundImage(FALLBACK_IMAGES[fallbackIndex]);
          setHasError(true);
          setIsLoading(false);
        };
        img.src = selectedImage;
        
      } catch (error) {
        console.error('Error loading background image:', error);
        // Use a fallback image
        const fallbackIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
        setBackgroundImage(FALLBACK_IMAGES[fallbackIndex]);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadRandomBackground();
  }, []);

  return {
    backgroundImage,
    isLoading,
    hasError,
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
