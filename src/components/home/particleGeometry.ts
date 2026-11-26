export const HOLE_RADIUS = 0.68;
export const DEPTH = 2.8;
export const FOCAL = 4.2;
// Fixed viewing angle: tips the tunnel so its inner and outer rims meet at
// the lower-left. The pointer rotation is layered on top of this base view.
export const BASE_VIEW = { x: 0.235, y: 0.235 };
export const RING_LEFT_INSET = 0.1;

export interface ParticleGeometry {
  scale: number;
  centerX: number;
  centerY: number;
  farCenterX: number;
  farCenterY: number;
  farRadius: number;
}

/**
 * Screen-space geometry shared by the particle field and the opening
 * animation, so both agree on where the ring and its far opening sit.
 */
export const getParticleGeometry = (
  width: number,
  height: number,
): ParticleGeometry => {
  const scale = Math.min(width * 0.44, Math.max(0, height - 170) * 0.48);
  const centerX = width * RING_LEFT_INSET + scale;
  const centerY = height * 0.477;

  const a = BASE_VIEW.x;
  const b = BASE_VIEW.y;
  const z = -DEPTH;
  const x1 = z * Math.sin(b);
  const z1 = z * Math.cos(b);
  const y1 = -z1 * Math.sin(a);
  const z2 = z1 * Math.cos(a);
  const perspective = FOCAL / (FOCAL - z2 * 0.9);

  return {
    scale,
    centerX,
    centerY,
    farCenterX: centerX + x1 * perspective * scale,
    farCenterY: centerY + y1 * perspective * scale,
    farRadius: HOLE_RADIUS * perspective * scale * Math.cos(b),
  };
};
