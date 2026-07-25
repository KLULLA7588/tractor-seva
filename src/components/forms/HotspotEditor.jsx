import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { api } from '../../lib/api-client';
import { imageUrl } from '../../lib/utils';

export default function HotspotEditor({ imagePath, imageId, part, existingCoordinate = null, coordinateId = null, onSaved, onCancel }) {
  const [coords, setCoords] = useState(
    existingCoordinate
      ? { x: parseFloat(existingCoordinate.x_coordinate), y: parseFloat(existingCoordinate.y_coordinate) }
      : null
  );
  const [hotspotSize, setHotspotSize] = useState(existingCoordinate?.radius || 2);
  const [saving, setSaving] = useState(false);
  const [imgWidth, setImgWidth] = useState(0);
  const imgRef = useRef(null);
  const isSubmitting = useRef(false);

  const measureImgWidth = () => {
    if (imgRef.current) setImgWidth(imgRef.current.offsetWidth);
  };

  useEffect(() => {
    measureImgWidth();
    window.addEventListener('resize', measureImgWidth);
    return () => window.removeEventListener('resize', measureImgWidth);
  }, []);

  const handleClick = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  const handleSave = async () => {
    if (!coords) {
      toast.error('Please click on the diagram to place a hotspot');
      return;
    }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setSaving(true);
    try {
      if (existingCoordinate && existingCoordinate.id) {
        // Case 1 (unchanged): moving an already-placed hotspot — update its coordinate.
        const result = await api.put(`/admin/parts/hotspots/${existingCoordinate.id}`, {
          x_coordinate: coords.x,
          y_coordinate: coords.y,
          radius: hotspotSize,
        });
        toast.success('Hotspot position updated');
        onSaved?.(result.coordinate);
      } else if (existingCoordinate) {
        // Case 2 (unchanged): malformed existingCoordinate with no id.
        toast.error('Hotspot coordinate ID is missing');
        return;
      } else if (coordinateId) {
        // Case 3 (THE FIX): a coordinate row for this part+image already exists
        // (bulk-imported "awaiting placement" part, or an Extra Part) — it just
        // has null x/y so far. Set its position instead of creating a brand new
        // part, which is what was silently duplicating parts before.
        const result = await api.put(`/admin/parts/hotspots/${coordinateId}`, {
          x_coordinate: coords.x,
          y_coordinate: coords.y,
          radius: hotspotSize,
        });
        toast.success('Hotspot placed successfully');
        onSaved?.(result.coordinate);
      } else if (part?.id) {
        // Case 4 (NEW): this part already exists in the DB but has NO coordinate
        // row at all for this image (e.g. placing an existing Combined-mode part
        // onto a different diagram it isn't linked to yet).
        // Requires the addHotspotToExistingPart backend endpoint.
        const result = await api.post(`/admin/parts/${part.id}/hotspots`, {
          image_id: imageId,
          x_coordinate: coords.x,
          y_coordinate: coords.y,
          radius: hotspotSize,
        });
        toast.success('Hotspot placed successfully');
        onSaved?.(result.coordinate);
      } else {
        // Case 5 (unchanged): brand new part (no id yet) — create part + coordinate together.
        const result = await api.post('/admin/parts', {
          serial_no: part.serial_no,
          part_no: part.part_no,
          kubota_part_no: part.kubota_part_no || null,
          description: part.description || null,
          quantity: part.quantity || 1,
          fm_code: part.fm_code || null,
          image_id: imageId,
          x_coordinate: coords.x,
          y_coordinate: coords.y,
          radius: hotspotSize,
        });
        toast.success('Hotspot placed successfully');
        onSaved?.(result.coordinate);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save hotspot');
      console.error('Hotspot save error:', err);
    } finally {
      setSaving(false);
      isSubmitting.current = false;
    }
  };

  if (!imagePath) {
    return (
      <div className="rounded-md border border-dashed border-border-subtle bg-bg-light p-6 text-center">
        <p className="text-sm text-text-gray">No diagram available. Upload a diagram first before placing hotspots.</p>
      </div>
    );
  }

  const pixelRadius = imgWidth > 0 ? (hotspotSize / 100) * imgWidth : 14;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-text-gray mb-3">
          Click on the diagram to place the hotspot for{' '}
          <span className="font-medium text-brand-navy">{part?.part_no}</span>
        </p>

        <div className="relative inline-block max-w-full overflow-hidden rounded-lg border border-border-subtle">
          <img
            ref={imgRef}
            src={imageUrl(imagePath)}
            alt="Diagram"
            onClick={handleClick}
            onLoad={measureImgWidth}
            className="block max-w-full cursor-crosshair h-auto"
          />
          {coords && (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                setHotspotSize((prev) => Math.min(prev + 0.3, 8));
              }}
              className="absolute flex items-center justify-center rounded-full bg-white text-xs font-bold text-black shadow-lg border-2 border-black hover:brightness-95 transition-all"
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                width: `${pixelRadius * 2}px`,
                height: `${pixelRadius * 2}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {part?.serial_no || '1'}
            </div>
          )}
        </div>
      </div>

      {coords && (
        <div className="space-y-3 rounded-md bg-bg-light p-3">
          <p className="text-xs text-text-gray">Position: X: {coords.x}%, Y: {coords.y}%</p>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-2">
              Hotspot Size: {hotspotSize.toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.1"
              value={hotspotSize}
              onChange={(e) => setHotspotSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-brand-navy"
            />
            <p className="text-xs text-text-gray mt-1">Size is relative to the image, so it stays consistent everywhere it's shown. Double-click the hotspot to increase its size too.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !coords}>{saving ? 'Saving...' : 'Save Position'}</Button>
      </div>
    </div>
  );
}








// import { useState, useRef, useEffect } from 'react';
// import { toast } from 'sonner';
// import Button from '../ui/Button';
// import { api } from '../../lib/api-client';
// import { imageUrl } from '../../lib/utils';

// export default function HotspotEditor({ imagePath, imageId, part, existingCoordinate = null, onSaved, onCancel }) {
//   const [coords, setCoords] = useState(
//     existingCoordinate
//       ? { x: parseFloat(existingCoordinate.x_coordinate), y: parseFloat(existingCoordinate.y_coordinate) }
//       : null
//   );
//   const [hotspotSize, setHotspotSize] = useState(existingCoordinate?.radius || 2);
//   const [saving, setSaving] = useState(false);
//   const [imgWidth, setImgWidth] = useState(0);
//   const imgRef = useRef(null);
//   const isSubmitting = useRef(false);

//   const measureImgWidth = () => {
//     if (imgRef.current) setImgWidth(imgRef.current.offsetWidth);
//   };

//   useEffect(() => {
//     measureImgWidth();
//     window.addEventListener('resize', measureImgWidth);
//     return () => window.removeEventListener('resize', measureImgWidth);
//   }, []);

//   const handleClick = (e) => {
//     const rect = imgRef.current.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setCoords({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
//   };

//   const handleSave = async () => {
//     if (!coords) {
//       toast.error('Please click on the diagram to place a hotspot');
//       return;
//     }
//     if (isSubmitting.current) return;
//     isSubmitting.current = true;
//     setSaving(true);
//     try {
//       if (existingCoordinate && existingCoordinate.id) {
//         const result = await api.put(`/admin/parts/hotspots/${existingCoordinate.id}`, {
//           x_coordinate: coords.x,
//           y_coordinate: coords.y,
//           radius: hotspotSize,
//         });
//         toast.success('Hotspot position updated');
//         onSaved?.(result.coordinate);
//       } else if (existingCoordinate) {
//         toast.error('Hotspot coordinate ID is missing');
//         return;
//       } else {
//         const result = await api.post('/admin/parts', {
//           serial_no: part.serial_no,
//           part_no: part.part_no,
//           kubota_part_no: part.kubota_part_no || null,
//           description: part.description || null,
//           quantity: part.quantity || 1,
//           fm_code: part.fm_code || null,
//           image_id: imageId,
//           x_coordinate: coords.x,
//           y_coordinate: coords.y,
//           radius: hotspotSize,
//         });
//         toast.success('Hotspot placed successfully');
//         onSaved?.(result.coordinate);
//       }
//     } catch (err) {
//       toast.error(err.message || 'Failed to save hotspot');
//       console.error('Hotspot save error:', err);
//     } finally {
//       setSaving(false);
//       isSubmitting.current = false;
//     }
//   };

//   if (!imagePath) {
//     return (
//       <div className="rounded-md border border-dashed border-border-subtle bg-bg-light p-6 text-center">
//         <p className="text-sm text-text-gray">No diagram available. Upload a diagram first before placing hotspots.</p>
//       </div>
//     );
//   }

//   const pixelRadius = imgWidth > 0 ? (hotspotSize / 100) * imgWidth : 14;

//   return (
//     <div className="space-y-4">
//       <div>
//         <p className="text-sm text-text-gray mb-3">
//           Click on the diagram to place the hotspot for{' '}
//           <span className="font-medium text-brand-navy">{part?.part_no}</span>
//         </p>

//         <div className="relative inline-block max-w-full overflow-hidden rounded-lg border border-border-subtle">
//           <img
//             ref={imgRef}
//             src={imageUrl(imagePath)}
//             alt="Diagram"
//             onClick={handleClick}
//             onLoad={measureImgWidth}
//             className="block max-w-full cursor-crosshair h-auto"
//           />
//           {coords && (
//             <div
//               onDoubleClick={(e) => {
//                 e.stopPropagation();
//                 setHotspotSize((prev) => Math.min(prev + 0.3, 8));
//               }}
//               className="absolute flex items-center justify-center rounded-full bg-white text-xs font-bold text-black shadow-lg border-2 border-black hover:brightness-95 transition-all"
//               style={{
//                 left: `${coords.x}%`,
//                 top: `${coords.y}%`,
//                 width: `${pixelRadius * 2}px`,
//                 height: `${pixelRadius * 2}px`,
//                 transform: 'translate(-50%, -50%)',
//               }}
//             >
//               {part?.serial_no || '1'}
//             </div>
//           )}
//         </div>
//       </div>

//       {coords && (
//         <div className="space-y-3 rounded-md bg-bg-light p-3">
//           <p className="text-xs text-text-gray">Position: X: {coords.x}%, Y: {coords.y}%</p>

//           <div>
//             <label className="block text-sm font-medium text-brand-navy mb-2">
//               Hotspot Size: {hotspotSize.toFixed(1)}%
//             </label>
//             <input
//               type="range"
//               min="0.5"
//               max="8"
//               step="0.1"
//               value={hotspotSize}
//               onChange={(e) => setHotspotSize(parseFloat(e.target.value))}
//               className="w-full h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-brand-navy"
//             />
//             <p className="text-xs text-text-gray mt-1">Size is relative to the image, so it stays consistent everywhere it's shown. Double-click the hotspot to increase its size too.</p>
//           </div>
//         </div>
//       )}

//       <div className="flex gap-3">
//         <Button variant="outline" onClick={onCancel}>Cancel</Button>
//         <Button onClick={handleSave} disabled={saving || !coords}>{saving ? 'Saving...' : 'Save Position'}</Button>
//       </div>
//     </div>
//   );
// }
