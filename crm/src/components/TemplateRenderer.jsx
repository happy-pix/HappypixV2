import React from 'react';

export default function TemplateRenderer({ layout, design, cachedAssets = {}, onSlotChange, onSlotDelete }) {
  if (!layout) return null;

  const { width = 1200, height = 1800, slots = [], aspect } = layout;
  const themeColor = design?.palette?.background || '#342F5C';
  
  let bgUrl = null;
  if (design?.background?.assetId) {
    // Prefer cached blob URL, otherwise fallback to external URL
    bgUrl = cachedAssets[design.background.assetId] || design.background.url;
  }

  // Common styles — use explicit properties to avoid React shorthand/non-shorthand warning
  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    aspectRatio: aspect || (width / height),
    backgroundColor: themeColor,
    backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: '6px'
  };

  const decorationStyle = (dec) => {
    let decUrl = null;
    if (dec.assetId) {
      decUrl = cachedAssets[dec.assetId] || dec.url;
    }
    
    // Convert absolute positions relative to canvas to percentages
    const style = {
      position: 'absolute',
      backgroundImage: decUrl ? `url(${decUrl})` : 'none',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      zIndex: dec.overlay ? 3 : 1, // 3 is above slots (zIndex 2)
      pointerEvents: 'none'
    };

    if (dec.x !== undefined && dec.y !== undefined) {
      style.left = `${dec.x * 100}%`;
      style.top = `${dec.y * 100}%`;
      style.width = `${dec.width * 100}%`;
      style.height = `${dec.height * 100}%`;
    } else if (dec.position === 'top-right') {
      style.top = 0;
      style.right = 0;
      style.width = '30%';
      style.height = '30%';
    } else if (dec.position === 'bottom-left') {
      style.bottom = 0;
      style.left = 0;
      style.width = '30%';
      style.height = '30%';
    } else {
      // background decoration
      style.inset = 0;
      style.backgroundSize = 'cover';
    }
    return style;
  };

  const slotStyle = (slot) => {
    const border = design?.photoTreatment?.border ? `${design.photoTreatment.borderWidth || 4}px solid ${design?.palette?.primary || '#fff'}` : 'none';
    const shadow = design?.photoTreatment?.shadow ? '0px 4px 12px rgba(0,0,0,0.4)' : 'none';

    return {
      position: 'absolute',
      left: `${slot.x * 100}%`,
      top: `${slot.y * 100}%`,
      width: `${slot.width * 100}%`,
      height: `${slot.height * 100}%`,
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // placeholder
      border: border,
      boxShadow: shadow,
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: design?.palette?.text || '#ffffff',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 2
    };
  };

  const [activeSlotId, setActiveSlotId] = React.useState(null);

  return (
    <div 
      style={wrapperStyle}
      onClick={(e) => {
        // Deselect if clicked directly on background (not on a slot)
        if (e.target === e.currentTarget) setActiveSlotId(null);
      }}
    >
      {/* Decorations Layer */}
      {design?.decorations?.map((dec, i) => (
        <div key={i} style={decorationStyle(dec)} />
      ))}

      {/* Photo Slots Layer */}
      {slots.map(slot => (
        <InteractiveSlot 
          key={slot.id} 
          slot={slot} 
          style={slotStyle(slot)} 
          isEditable={!!onSlotChange}
          isActive={activeSlotId === slot.id}
          onSelect={() => setActiveSlotId(slot.id)}
          onChange={(newSlot) => onSlotChange && onSlotChange(newSlot)}
          onDelete={onSlotDelete ? () => onSlotDelete(slot.id) : undefined}
        />
      ))}
      
      {/* Fallback pattern if no bg image */}
      {!bgUrl && (
         <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at center, white 10%, transparent 10%)', backgroundSize: '20px 20px', zIndex: 0, pointerEvents: 'none' }} />
      )}
    </div>
  );
}

// Internal component for handling drag and resize
function InteractiveSlot({ slot, style, isEditable, isActive, onSelect, onChange, onDelete }) {
  const slotRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isEditable) return;
      
      const parent = slotRef.current?.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();

      if (isDragging) {
        let newX = (e.clientX - rect.left) / rect.width - (slot.width / 2);
        let newY = (e.clientY - rect.top) / rect.height - (slot.height / 2);
        
        // Boundaries
        newX = Math.max(0, Math.min(newX, 1 - slot.width));
        newY = Math.max(0, Math.min(newY, 1 - slot.height));
        
        onChange({ ...slot, x: newX, y: newY });
      } else if (isResizing) {
        const slotRect = slotRef.current.getBoundingClientRect();
        let newWidth = (e.clientX - slotRect.left) / rect.width;
        let newHeight = (e.clientY - slotRect.top) / rect.height;

        // Boundaries & min sizes
        newWidth = Math.max(0.05, Math.min(newWidth, 1 - slot.x));
        newHeight = Math.max(0.05, Math.min(newHeight, 1 - slot.y));

        onChange({ ...slot, width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, slot, isEditable, onChange]);

  return (
    <div 
      ref={slotRef}
      style={{
        ...style, 
        cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        outline: isActive && isEditable ? '2px dashed #00ffd5' : 'none',
        outlineOffset: '2px'
      }}
      onMouseDown={(e) => {
        if (!isEditable) return;
        if (e.target.dataset.resizer) return; // don't drag if clicking resizer
        e.preventDefault();
        onSelect();
        setIsDragging(true);
      }}
    >
      <span style={{ pointerEvents: 'none' }}>PHOTO {slot.id}</span>

      {/* Resize Handle */}
      {isEditable && isActive && (
        <div 
          data-resizer="true"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
          }}
          style={{
            position: 'absolute',
            bottom: '-5px',
            right: '-5px',
            width: '15px',
            height: '15px',
            background: '#00ffd5',
            borderRadius: '50%',
            cursor: 'nwse-resize',
            zIndex: 10
          }}
        />
      )}
      {/* Delete Handle */}
      {isEditable && isActive && onDelete && (
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '20px',
            height: '20px',
            background: '#ff0033',
            color: 'white',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          title="Delete Slot"
        >
          ×
        </div>
      )}
    </div>
  );
}
