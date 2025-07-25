// frontend/src/components/bauhausMath.js
export const BAUHAUS_COLORS = ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#22223B"];
export function glyphToColor(g) {
  if (g === "/") return BAUHAUS_COLORS[0];
  if (g === "\\") return BAUHAUS_COLORS[1];
  if (g === "|") return BAUHAUS_COLORS[2];
  if (g === "7") return BAUHAUS_COLORS[3];
  if (g === "_") return BAUHAUS_COLORS[4];
  return "#CCCCCC";
}
export function drawBauhausSVG(glyphs, a = 30) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const tau = 2 * Math.PI;
  const deltaTheta = tau * (2 - phi);
  let kappa = 0;
  let svg = `<svg viewBox="0 0 400 400" width="400" height="400" xmlns="http://www.w3.org/2000/svg">\n`;
  for (let k = 0; k < glyphs.length; ++k) {
    let r = a * Math.sqrt(k + 1);
    let theta = k * deltaTheta;
    let x = 200 + r * Math.cos(theta);
    let y = 200 + r * Math.sin(theta);
    let col = glyphToColor(glyphs[k]);
    if (glyphs[k] === "/") kappa += 1;
    if (glyphs[k] === "\\") kappa -= 1;
    svg += `<circle cx="${x}" cy="${y}" r="${10 + 2 * Math.abs(kappa)}" fill="${col}" opacity="0.9"/>\n`;
    if (glyphs[k] === "7" || kappa === 0) {
      svg += `<circle cx="${x}" cy="${y}" r="16" fill="gold" opacity="0.5"/>\n`;
    }
  }
  svg += `</svg>`;
  return svg;
}
