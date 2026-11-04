// Inspect the math in MarketLogo.tsx for flipkart at height=18
const m = {
  logoWidth: 1200,
  logoHeight: 800,
  heightScale: 0.92,
  cropBox: {
    cropX: 0.115,
    cropY: 0.3475,
    cropW: 0.77,
    cropH: 0.305,
  }
};

const baseH = 18;
const scale = m.heightScale;
const crop = m.cropBox;
const graphicW = m.logoWidth * crop.cropW; // 1200 * 0.77 = 924
const graphicH = m.logoHeight * crop.cropH; // 800 * 0.305 = 244
const graphicAspect = graphicW / graphicH; // 3.78688

const visibleH = Math.round(baseH * scale); // Math.round(18 * 0.92) = 17
const visibleW = Math.round(visibleH * graphicAspect); // Math.round(17 * 3.78688) = 64

const svgW = Math.round(visibleW / crop.cropW); // 64 / 0.77 = 83
const svgH = Math.round(visibleH / crop.cropH); // 17 / 0.305 = 56

console.log({ visibleW, visibleH, svgW, svgH });
