// VAE math and visualization utilities

export function gaussianPdf(x, mu = 0, sigma = 1) {
  const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
  return coeff * Math.exp(exponent);
}

export function calculateKLGaussian(mu, logVar) {
  // KL(N(mu, sigma^2) || N(0, 1)) = -0.5 * (1 + logVar - mu^2 - exp(logVar))
  const var_ = Math.exp(logVar);
  const kl = -0.5 * (1 + logVar - Math.pow(mu, 2) - var_);
  return Math.max(0, kl);
}

// Generate synthetic 2D digit/shape representation from latent coordinates (z1, z2)
export function decodeToyLatent(z1, z2) {
  // Synthesize an 8x8 pixel grid based on latent coordinates:
  // z1 controls thickness / stroke curvature
  // z2 controls scale / shape archetype (0 -> circle, 1 -> digit 8, -1 -> digit 0/1)
  const size = 8;
  const grid = [];
  const cx = size / 2;
  const cy = size / 2;
  
  // Radius and elongation modulated by z
  const rX = Math.max(1.2, 2.8 + z1 * 0.8);
  const rY = Math.max(1.2, 2.8 + z2 * 0.8);
  const angle = (z1 * 0.3);

  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const dx = (x - cx + 0.5);
      const dy = (y - cy + 0.5);
      // Rotated distance
      const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
      const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
      
      const dist = Math.pow(rx / rX, 2) + Math.pow(ry / rY, 2);
      // Gaussian ring or blob intensity
      let val = Math.exp(-Math.pow(dist - 1.0, 2) / 0.4);
      if (Math.abs(z2) < 0.5 && dist < 0.6) {
        val = Math.max(val, Math.exp(-dist / 0.5));
      }
      row.push(Math.min(1, Math.max(0, val)));
    }
    grid.push(row);
  }
  return grid;
}
