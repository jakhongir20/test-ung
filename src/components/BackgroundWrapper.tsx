import type { FC, ReactNode } from 'react';
import { useRandomBackground } from '../hooks/useRandomBackground';

interface BackgroundWrapperProps {
  children: ReactNode;
  className?: string;
}

export const BackgroundWrapper: FC<BackgroundWrapperProps> = ({
  children,
  className = ''
}) => {
  const { backgroundImage, isLoading, hasError } = useRandomBackground();

  return (
    <>
      {/* CSS for full-screen background coverage with fade effect */}
      <style>{`
        .bg-full-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          background-image: url(${backgroundImage});
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          background-attachment: fixed;
          opacity: 0.4;
          transition: opacity 0.3s ease-in-out;
        }
        
        .bg-full-screen.loading {
          opacity: 0.1;
        }
        
        .bg-full-screen.error {
          opacity: 0.2;
        }
        
        .bg-fade-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(240, 248, 255, 0.2) 50%, rgba(255, 255, 255, 0.4) 100%);
          pointer-events: none;
        }
        
        @media (max-width: 768px) {
          .bg-full-screen {
            background-attachment: scroll !important;
          }
        }
      `}</style>

      {/* Full-screen background */}
      <div className={`bg-full-screen ${isLoading ? 'loading' : hasError ? 'error' : ''}`}></div>

      {/* Fade overlay */}
      <div className="bg-fade-overlay"></div>

      {/* Content */}
      <div className={`relative z-10 min-h-screen ${className}`}>
        {children}
      </div>
    </>
  );
};
