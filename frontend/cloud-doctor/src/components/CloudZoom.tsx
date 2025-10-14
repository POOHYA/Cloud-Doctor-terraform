import { useEffect, useRef, useState } from 'react';

interface CloudZoomProps {
  smallImage: string;
  largeImage: string;
  title?: string;
  zoomWidth?: number | 'auto';
  zoomHeight?: number | 'auto';
  position?: 'top' | 'right' | 'bottom' | 'left' | 'inside';
  showTitle?: boolean;
  lensOpacity?: number;
  smoothMove?: number;
  adjustX?: number;
  adjustY?: number;
}

export default function CloudZoom({
  smallImage,
  largeImage,
  title,
  zoomWidth = 150,
  zoomHeight = 150,
  position = 'right',
  showTitle = true,
  lensOpacity = 0.5,
  smoothMove = 3,
  adjustX = 10,
  adjustY = 0
}: CloudZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={smallImage}
        alt={title}
        title={title}
        className="block cursor-crosshair"
        style={{ width: '20px', height: '20px' }}
      />

      {/* 줌 윈도우 */}
      {isZooming && (
        <div
          className="absolute border-2 border-gray-300 overflow-hidden bg-white shadow-lg rounded-lg z-50"
          style={{
            left: position === 'right' ? '30px' : position === 'left' ? '-160px' : '0px',
            top: position === 'bottom' ? '30px' : position === 'top' ? '-160px' : '0px',
            width: typeof zoomWidth === 'number' ? zoomWidth : 150,
            height: typeof zoomHeight === 'number' ? zoomHeight : 150,
            backgroundImage: `url(${largeImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          {/* 제목 */}
          {showTitle && title && (
            <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-75 text-white text-center text-xs py-1">
              {title}
            </div>
          )}
        </div>
      )}
    </div>
  );
}