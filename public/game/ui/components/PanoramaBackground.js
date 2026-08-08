
const PanoramaBackground = ({
  src,
  themeConfig,
  fallbackOpacity = 0.8
}) => {
  const [imgWidth, setImgWidth] = React.useState(0);
  const [imgHeight, setImgHeight] = React.useState(0);
  const [motionType, setMotionType] = React.useState("static");
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [containerSize, setContainerSize] = React.useState({
    w: 400,
    h: 150
  });
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = e => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setContainerSize({
          w: entries[0].contentRect.width,
          h: entries[0].contentRect.height
        });
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      mediaQuery.removeEventListener("change", handler);
      observer.disconnect();
    };
  }, []);
  const handleImageLoad = e => {
    const {
      naturalWidth,
      naturalHeight
    } = e.target;
    setImgWidth(naturalWidth);
    setImgHeight(naturalHeight);
    let type = "static";
    if (themeConfig?.continueCard?.motion) {
      type = themeConfig.continueCard.motion;
    } else {
      const containerRatio = containerSize.w / (containerSize.h || 1);
      const imageRatio = naturalWidth / (naturalHeight || 1);
      if (imageRatio > containerRatio * 1.3) {
        type = "pingpong";
      }
    }
    setMotionType(type);
  };
  React.useEffect(() => {
    if (imgWidth && imgHeight && !themeConfig?.continueCard?.motion) {
      const containerRatio = containerSize.w / (containerSize.h || 1);
      const imageRatio = imgWidth / (imgHeight || 1);
      setMotionType(imageRatio > containerRatio * 1.3 ? "pingpong" : "static");
    }
  }, [containerSize.w, containerSize.h, imgWidth, imgHeight, themeConfig]);
  const scale = imgHeight ? containerSize.h / imgHeight : 1;
  const renderedWidth = imgWidth * scale;
  const travelDistance = Math.max(0, renderedWidth - containerSize.w);
  const isActive = travelDistance > 0 && motionType !== "static" && !reducedMotion;
  if (isActive && motionType === "loop") {
    const duration = Math.max(10, renderedWidth / 20);
    return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden flex">
                <style dangerouslySetInnerHTML={{
        __html: `
                    @keyframes loopPanorama {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `
      }} />
                <div className="flex h-full min-w-max" style={{
        animation: `loopPanorama ${duration}s linear infinite`,
        opacity: fallbackOpacity,
        width: `${renderedWidth * 2}px`
      }}>
                    <img src={src} className="h-full object-cover shrink-0 max-w-none" style={{
          width: `${renderedWidth}px`
        }} alt="" onLoad={handleImageLoad} />
                    <img src={src} className="h-full object-cover shrink-0 max-w-none" style={{
          width: `${renderedWidth}px`
        }} alt="" />
                </div>
            </div>;
  }
  if (isActive && motionType === "pingpong") {
    const duration = Math.max(10, travelDistance / 20);
    return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <style dangerouslySetInnerHTML={{
        __html: `
                    @keyframes pingpongPanorama {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-${travelDistance}px); }
                    }
                `
      }} />
                <img src={src} onLoad={handleImageLoad} className="absolute inset-0 h-full max-w-none" style={{
        animation: `pingpongPanorama ${duration}s ease-in-out infinite alternate`,
        opacity: fallbackOpacity,
        width: `${renderedWidth}px`
      }} alt="" />
            </div>;
  }
  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <img src={src} onLoad={handleImageLoad} className="absolute inset-0 w-full h-full object-cover" style={{
      opacity: fallbackOpacity
    }} alt="" />
        </div>;
};
window.PanoramaBackground = PanoramaBackground;
