// lib/scaleMapper.ts – maps radius → nodeId / rib params

import sha1 from 'js-sha1';
export interface ScaleInfo {
  level: number;      // power-of-ten scale
  nodeId: number;     // 1-89
  a: number;          // φ-fan radial coeff
}
const GOLDEN = 1.61803398875;
const REF_R  = 1e-6; // metres (human scale)

export function mapScale(seed: string, targetRadius: number): ScaleInfo {
  const level = Math.floor(Math.log10(targetRadius / REF_R));
  const hash  = sha1(`${level}${seed}`);
  const node  = (parseInt(hash.slice(0,2),16) % 89) + 1;
  const a     = Math.pow(GOLDEN, level);
  return { level, nodeId: node, a };
}
