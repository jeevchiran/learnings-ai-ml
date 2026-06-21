import { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'

export default function ProjectionWidget() {
  const ref = useRef(null)
  useEffect(() => {
    const y = [3, 5, 2], yhat = [3, 5, 0]
    Plotly.newPlot(ref.current, [
      { type: 'mesh3d',
        x: [-6, 6, 6, -6], y: [-6, -6, 6, 6], z: [0, 0, 0, 0],
        i: [0, 0], j: [1, 2], k: [2, 3],
        opacity: 0.2, color: '#e2e8f0', name: 'Col(X)' },
      { type: 'scatter3d', mode: 'lines+markers',
        x: [0, y[0]], y: [0, y[1]], z: [0, y[2]],
        line: { color: '#3182ce', width: 6 }, marker: { size: [0, 6], color: '#3182ce' },
        name: 'y (observed)' },
      { type: 'scatter3d', mode: 'lines+markers',
        x: [0, yhat[0]], y: [0, yhat[1]], z: [0, yhat[2]],
        line: { color: '#e53e3e', width: 6 }, marker: { size: [0, 6], color: '#e53e3e' },
        name: 'ŷ (projection)' },
      { type: 'scatter3d', mode: 'lines+markers',
        x: [yhat[0], y[0]], y: [yhat[1], y[1]], z: [yhat[2], y[2]],
        line: { color: '#38a169', width: 4, dash: 'dash' }, marker: { size: [0, 5], color: '#38a169' },
        name: 'e = y − ŷ (residual)' },
      { type: 'scatter3d', mode: 'lines',
        x: [yhat[0], yhat[0] + 0.3, yhat[0] + 0.3],
        y: [yhat[1], yhat[1], yhat[1] + 0.3],
        z: [0.3, 0.3, 0],
        line: { color: '#666', width: 2 }, showlegend: false },
    ], {
      scene: {
        xaxis: { title: 'x₁', range: [-1, 6] },
        yaxis: { title: 'x₂', range: [-1, 6] },
        zaxis: { title: 'x₃', range: [-1, 4] },
        camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
        annotations: [
          { x: y[0], y: y[1], z: y[2], text: 'y', showarrow: false, font: { size: 14, color: '#3182ce' } },
          { x: yhat[0], y: yhat[1], z: yhat[2], text: 'ŷ', showarrow: false, font: { size: 14, color: '#e53e3e' } },
        ],
      },
      margin: { t: 20, b: 20 },
      paper_bgcolor: 'transparent',
      legend: { x: 0, y: 1 },
    }, { responsive: true, displayModeBar: false })
  }, [])
  return <div ref={ref} style={{ minHeight: 420 }} />
}
