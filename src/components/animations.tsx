import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  className?: string;
}

export const FadeIn: FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 500,
  direction = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'top':
        return isVisible ? 'translateY(0)' : 'translateY(-20px)';
      case 'bottom':
        return isVisible ? 'translateY(0)' : 'translateY(20px)';
      case 'left':
        return isVisible ? 'translateX(0)' : 'translateX(-20px)';
      case 'right':
        return isVisible ? 'translateX(0)' : 'translateX(20px)';
      default:
        return 'translateY(0)';
    }
  };

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
};

interface StaggeredFadeInProps {
  children: ReactNode[];
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'none';
  className?: string;
}

export const StaggeredFadeIn: FC<StaggeredFadeInProps> = ({
  children,
  delay = 0,
  staggerDelay = 100,
  duration = 500,
  direction = 'top',
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={delay + (index * staggerDelay)}
          duration={duration}
          direction={direction}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: FC<PageTransitionProps> = ({
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 300ms ease-out, transform 300ms ease-out',
      }}
    >
      {children}
    </div>
  );
};

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
}

export const CardHover: FC<CardHoverProps> = ({
  children,
  className = '',
  hoverScale = 1.02
}) => {
  return (
    <div
      className={`transition-all duration-300 ease-out hover:scale-${hoverScale} hover:shadow-lg ${className}`}
      style={{
        transform: 'scale(1)',
      }}
    >
      {children}
    </div>
  );
};
