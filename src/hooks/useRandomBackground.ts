import { useState, useEffect } from 'react';

// Import background images as modules
import bg1 from '../assets/backgrounds/01.jpg';
import bg2 from '../assets/backgrounds/02.jpg';
import bg3 from '../assets/backgrounds/03.jpg';
import bg4 from '../assets/backgrounds/04.jpg';
import bg5 from '../assets/backgrounds/05.jpg';
import bg6 from '../assets/backgrounds/06.jpg';
import bg7 from '../assets/backgrounds/07.jpg';
import bg8 from '../assets/backgrounds/08.jpg';

// Array of imported background images
const BACKGROUND_IMAGES = [
  bg1,
  bg2,
  bg3,
  bg4,
  bg5,
  bg6,
  bg7,
  bg8,
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
        
        // Select a random background image from imported modules
        const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
        const selectedImage = BACKGROUND_IMAGES[randomIndex];
        
        // Since these are imported modules, they should be available immediately
        setBackgroundImage(selectedImage);
        setIsLoading(false);
        console.log(`✅ Loaded random background image: ${randomIndex + 1}`);
        
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
