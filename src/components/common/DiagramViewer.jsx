import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { imageUrl } from '../../lib/utils';

export default function DiagramViewer({ src, hotspots = [], onHotspotClick, interactive = false }) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const wrapperRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgBox, setImgBox] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const minZoom = 0.5;
  const maxZoom = 3;
  const zoomStep = 0.2;

  // Measure the image's LAYOUT box (offset*), not its on-screen box.
  // offsetLeft/offsetTop/offsetWidth/offsetHeight are unaffected by the
  // CSS transform (scale/translate) applied to wrapperRef, so hotspots
  // stay correctly pinned to the image at any zoom/pan level.
  const measureImage = () => {
    if (!imageRef.current || !wrapperRef.current) return;
    const img = imageRef.current;
    setImgBox({
      width: img.offsetWidth,
      height: img.offsetHeight,
      left: img.offsetLeft,
      top: img.offsetTop,
    });
  };

  useEffect(() => {
    if (!imageLoaded) return;
    measureImage();
    window.addEventListener('resize', measureImage);
    return () => window.removeEventListener('resize', measureImage);
  }, [imageLoaded]);

  // Handle mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!imageLoaded) return;
      e.preventDefault();

      const delta = e.deltaY > 0 ? -1 : 1;
      const newZoom = Math.min(
        maxZoom,
        Math.max(minZoom, zoom + delta * zoomStep)
      );

      setZoom(newZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, imageLoaded]);

  // Handle mouse drag for panning
  const handleMouseDown = (e) => {
    if (!imageLoaded) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(maxZoom, prev + zoomStep));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(minZoom, prev - zoomStep));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleHotspotClick = (hotspot) => {
    if (interactive && onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  if (!src) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-border-subtle bg-bg-inset">
        <p className="text-text-gray">No diagram available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-full bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Fixed size diagram container */}
      <div className="relative flex-1 min-h-[400px] md:min-h-[600px] lg:min-h-[700px] overflow-hidden cursor-grab active:cursor-grabbing bg-black flex items-center justify-center">
        <div
          ref={wrapperRef}
          className="relative flex items-center justify-center"
          onMouseDown={handleMouseDown}
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            transformOrigin: 'center',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl(src)}
            alt="Diagram"
            className="max-w-full max-h-full object-contain pointer-events-none select-none bg-white rounded-lg"
            onLoad={() => {
              setImageLoaded(true);
              measureImage();
            }}
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
            }}
          />

          {/* Hotspots — positioned relative to the actual image box, not the wrapper */}
          {interactive &&
            hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => handleHotspotClick(hotspot)}
                className="absolute w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-brand-navy text-white rounded-full border-2 border-white shadow-lg hover:bg-brand-navy-light hover:scale-110 transition-all cursor-pointer text-xs md:text-sm font-bold"
                style={{
                  left: `${imgBox.left + (hotspot.x_coordinate / 100) * imgBox.width}px`,
                  top: `${imgBox.top + (hotspot.y_coordinate / 100) * imgBox.height}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={hotspot.label}
              >
                {hotspot.label}
              </button>
            ))}
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-black/80 px-4 md:px-6 py-3 text-center">
        <p className="text-xs md:text-sm text-gray-400 font-medium">
          DRAG TO PAN · SCROLL / PINCH TO ZOOM
        </p>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-4 bottom-20 md:bottom-24 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-lg transition-all"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
}