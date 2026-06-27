import React, { useRef, useEffect, useState } from 'react';

export const FaceBoundingBoxCanvas = ({ imageUrl, photoIndex, records = [], unknownFaces = [] }) => {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Filter records & unknown faces for this specific classroom photo index
  const activeRecords = records.filter(
    (r) => r.status === 'Present' && r.photoIndex === photoIndex && r.boundingBox
  );
  
  const activeUnknowns = unknownFaces.filter(
    (u) => u.photoIndex === photoIndex && u.boundingBox && !u.assignedStudent
  );

  const handleImageLoad = () => {
    if (imgRef.current) {
      const { clientWidth, clientHeight, naturalWidth, naturalHeight } = imgRef.current;
      setDimensions({
        clientWidth,
        clientHeight,
        naturalWidth,
        naturalHeight,
      });
      setImageLoaded(true);
    }
  };

  // Recalculate dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current && imageLoaded) {
        const { clientWidth, clientHeight } = imgRef.current;
        setDimensions((prev) => ({
          ...prev,
          clientWidth,
          clientHeight,
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded]);

  // Draw overlays on canvas
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { clientWidth, clientHeight, naturalWidth, naturalHeight } = dimensions;
    
    // Scaling factors
    const scaleX = clientWidth / naturalWidth;
    const scaleY = clientHeight / naturalHeight;

    // Draw Identified faces (Green)
    activeRecords.forEach((rec) => {
      const box = rec.boundingBox;
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      ctx.strokeStyle = '#10b981'; // emerald-500
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Label background
      ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
      const studentName = rec.student?.name || 'Student';
      ctx.font = '10px Inter, sans-serif';
      const textWidth = ctx.measureText(studentName).width;
      
      ctx.fillRect(x, y - 18, textWidth + 10, 18);
      
      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(studentName, x + 5, y - 5);
    });

    // Draw Unknown faces (Red)
    activeUnknowns.forEach((unk) => {
      const box = unk.boundingBox;
      const x = box.x * scaleX;
      const y = box.y * scaleY;
      const w = box.width * scaleX;
      const h = box.height * scaleY;

      ctx.strokeStyle = '#ef4444'; // red-500
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Label background
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.font = '10px Inter, sans-serif';
      const label = 'Unknown Person';
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillRect(x, y - 18, textWidth + 10, 18);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, x + 5, y - 5);
    });

  }, [imageLoaded, dimensions, activeRecords, activeUnknowns]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-[#0e0f14] flex items-center justify-center">
      <img
        ref={imgRef}
        src={imageUrl}
        alt={`Classroom Scene ${photoIndex + 1}`}
        onLoad={handleImageLoad}
        className="max-w-full h-auto object-contain block max-h-[500px]"
      />
      {imageLoaded && (
        <canvas
          ref={canvasRef}
          width={dimensions.clientWidth}
          height={dimensions.clientHeight}
          className="absolute pointer-events-none"
          style={{
            width: dimensions.clientWidth,
            height: dimensions.clientHeight,
          }}
        />
      )}
    </div>
  );
};

export default FaceBoundingBoxCanvas;
