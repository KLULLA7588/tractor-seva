export default function HotspotRenderer({ hotspots, onHotspotClick, interactive = false }) {
  return (
    <>
      {hotspots.map((hotspot, index) => {
        const label = hotspot.label || hotspot.serial_no || index + 1;
        return (
          <div
            key={hotspot.id || index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${parseFloat(hotspot.x_coordinate)}%`,
              top: `${parseFloat(hotspot.y_coordinate)}%`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (interactive && onHotspotClick) {
                  onHotspotClick(hotspot);
                }
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-button transition-all duration-200 ${
                interactive
                  ? 'cursor-pointer bg-brand-navy text-white hover:scale-110 hover:bg-brand-red'
                  : 'cursor-pointer bg-brand-navy/90 text-white hover:scale-110'
              }`}
              title={hotspot.part?.part_no || `Part ${label}`}
            >
              {label}
              {/* Sonar ping ring */}
              <span className="sonar-ring absolute inset-0 rounded-full bg-brand-navy" />
              {/* Static outer halo ring */}
              <span className="absolute -inset-[3px] rounded-full bg-brand-navy/15" />
            </button>
          </div>
        );
      })}
    </>
  );
}
