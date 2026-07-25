import { useEffect, useRef, useState, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import { generatePointCloud, covarianceMatrix, eigen2x2, mean2D, dot } from './linearAlgebraUtils.js'
import { plotlyLayout, PLOTLY_CONFIG } from '../utils.js'

const COLOR = '#475569'

// A point cloud's covariance matrix has two eigenvectors: the directions of
// maximum and minimum spread. Those ARE the principal components — SVD/PCA
// is eigendecomposition of the covariance matrix, nothing more exotic.
export default function SVDPCAWidget() {
  const scatterRef = useRef(null)
  const varRef = useRef(null)
  const [stretchRatio, setStretchRatio] = useState(3)
  const [angle, setAngle] = useState(0.5)
  const [project, setProject] = useState(false)

  const render = useCallback((ratio, ang, doProject) => {
    const points = generatePointCloud(180, { seed: 11, stretchX: ratio, stretchY: 1, angle: ang })
    const [mx, my] = mean2D(points)
    const cov = covarianceMatrix(points)
    const eig = eigen2x2(cov)
    // order by eigenvalue descending
    const order = eig.eigenvalues[0] >= eig.eigenvalues[1] ? [0, 1] : [1, 0]
    const pc1 = eig.eigenvectors[order[0]], pc2 = eig.eigenvectors[order[1]]
    const lam1 = eig.eigenvalues[order[0]], lam2 = eig.eigenvalues[order[1]]
    const scale1 = 2 * Math.sqrt(Math.max(lam1, 0)), scale2 = 2 * Math.sqrt(Math.max(lam2, 0))

    let plotPoints = points
    if (doProject) {
      plotPoints = points.map(([x, y]) => {
        const centered = [x - mx, y - my]
        const t = dot(centered, pc1)
        return [mx + t * pc1[0], my + t * pc1[1]]
      })
    }

    Plotly.react(scatterRef.current, [
      { x: plotPoints.map(p => p[0]), y: plotPoints.map(p => p[1]), mode: 'markers', type: 'scatter', marker: { color: COLOR, size: 5, opacity: 0.6 }, name: doProject ? 'projected onto PC1' : 'data' },
      { x: [mx - pc1[0] * scale1, mx + pc1[0] * scale1], y: [my - pc1[1] * scale1, my + pc1[1] * scale1], mode: 'lines', type: 'scatter', line: { color: '#dc2626', width: 3 }, name: 'PC1 (max variance)' },
      { x: [mx - pc2[0] * scale2, mx + pc2[0] * scale2], y: [my - pc2[1] * scale2, my + pc2[1] * scale2], mode: 'lines', type: 'scatter', line: { color: '#16a34a', width: 3 }, name: 'PC2' },
    ], plotlyLayout({
      title: { text: doProject ? 'Points projected onto PC1 — collapsed to 1D' : 'Point cloud with principal axes', font: { size: 13 } },
      xaxis: { title: 'x₁', range: [-8, 8], zeroline: true },
      yaxis: { title: 'x₂', range: [-8, 8], zeroline: true, scaleanchor: 'x' },
      legend: { orientation: 'h', y: -0.2 },
    }), PLOTLY_CONFIG)

    const total = lam1 + lam2
    Plotly.react(varRef.current, [{
      x: ['PC1', 'PC2'], y: [lam1 / total, lam2 / total], type: 'bar',
      marker: { color: ['#dc2626', '#16a34a'] },
      text: [lam1 / total, lam2 / total].map(v => (v * 100).toFixed(1) + '%'), textposition: 'outside',
    }], plotlyLayout({
      title: { text: 'Variance explained', font: { size: 13 } },
      yaxis: { title: 'fraction', range: [0, 1] }, showlegend: false,
    }), PLOTLY_CONFIG)
  }, [])

  useEffect(() => { render(stretchRatio, angle, project) }, []) // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.75rem', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Elongation
          <input type="range" min="1" max="6" step="0.5" value={stretchRatio}
            onChange={e => { const v = +e.target.value; setStretchRatio(v); render(v, angle, project) }} />
          <strong>{stretchRatio}×</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          Rotation
          <input type="range" min="0" max="3.14" step="0.1" value={angle}
            onChange={e => { const v = +e.target.value; setAngle(v); render(stretchRatio, v, project) }} />
          <strong>{((angle * 180) / Math.PI).toFixed(0)}°</strong>
        </label>
        <button onClick={() => { const v = !project; setProject(v); render(stretchRatio, angle, v) }}
          style={{ padding: '0.3rem 0.9rem', borderRadius: 6, border: '1px solid var(--border, #ccc)',
            background: project ? COLOR : 'transparent', color: project ? '#fff' : 'var(--text)',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
          {project ? '✓ Projected onto PC1' : 'Project onto PC1'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
        <div ref={scatterRef} style={{ minHeight: 320 }} />
        <div ref={varRef} style={{ minHeight: 320 }} />
      </div>
      <p style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '0.5rem' }}>
        PC1 is the eigenvector of the covariance matrix with the larger eigenvalue — the direction of maximum spread.
        Dropping PC2 (the projection button) is exactly what PCA dimensionality reduction does: keep the axis that explains the most variance, discard the rest.
      </p>
    </div>
  )
}
