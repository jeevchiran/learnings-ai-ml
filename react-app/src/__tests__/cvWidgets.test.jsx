import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import PixelInspectorWidget from '../components/widgets/cv/PixelInspectorWidget.jsx'
import ColorSpaceWidget from '../components/widgets/cv/ColorSpaceWidget.jsx'
import ImageMathWidget from '../components/widgets/cv/ImageMathWidget.jsx'
import FilterBankWidget from '../components/widgets/cv/FilterBankWidget.jsx'
import AffineWidget from '../components/widgets/cv/AffineWidget.jsx'
import FeatureDetectWidget from '../components/widgets/cv/FeatureDetectWidget.jsx'
import ROIWidget from '../components/widgets/cv/ROIWidget.jsx'
import HistogramWidget from '../components/widgets/cv/HistogramWidget.jsx'
import IoUWidget from '../components/widgets/cv/IoUWidget.jsx'
import LocalizationHeadWidget from '../components/widgets/cv/LocalizationHeadWidget.jsx'
import BoxLossWidget from '../components/widgets/cv/BoxLossWidget.jsx'
import NMSWidget from '../components/widgets/cv/NMSWidget.jsx'
import DetectionMetricWidget from '../components/widgets/cv/DetectionMetricWidget.jsx'
import DetectorCostWidget from '../components/widgets/cv/DetectorCostWidget.jsx'
import RCNNPipelineWidget from '../components/widgets/cv/RCNNPipelineWidget.jsx'
import DetectorCompareWidget from '../components/widgets/cv/DetectorCompareWidget.jsx'
import YOLOGridWidget from '../components/widgets/cv/YOLOGridWidget.jsx'
import YoloLabelWidget from '../components/widgets/cv/YoloLabelWidget.jsx'
import AnchorBoxWidget from '../components/widgets/cv/AnchorBoxWidget.jsx'
import SSDPyramidWidget from '../components/widgets/cv/SSDPyramidWidget.jsx'

const WIDGETS = [
  ['PixelInspector', PixelInspectorWidget],
  ['ColorSpace', ColorSpaceWidget],
  ['ImageMath', ImageMathWidget],
  ['FilterBank', FilterBankWidget],
  ['Affine', AffineWidget],
  ['FeatureDetect', FeatureDetectWidget],
  ['ROI', ROIWidget],
  ['Histogram', HistogramWidget],
  ['IoU', IoUWidget],
  ['LocalizationHead', LocalizationHeadWidget],
  ['BoxLoss', BoxLossWidget],
  ['NMS', NMSWidget],
  ['DetectionMetric', DetectionMetricWidget],
  ['DetectorCost', DetectorCostWidget],
  ['RCNNPipeline', RCNNPipelineWidget],
  ['DetectorCompare', DetectorCompareWidget],
  ['YOLOGrid', YOLOGridWidget],
  ['YoloLabel', YoloLabelWidget],
  ['AnchorBox', AnchorBoxWidget],
  ['SSDPyramid', SSDPyramidWidget],
]

describe('computer-vision widgets', () => {
  it.each(WIDGETS)('%s mounts without throwing', (_name, Widget) => {
    const { container } = render(<Widget />)
    expect(container.firstChild).not.toBeNull()
  })

  it('every slider in every widget moves without crashing', () => {
    for (const [, Widget] of WIDGETS) {
      const { container, unmount } = render(<Widget />)
      for (const input of container.querySelectorAll('input[type="range"]')) {
        fireEvent.change(input, { target: { value: input.max } })
        fireEvent.change(input, { target: { value: input.min } })
      }
      unmount()
    }
  })

  it('every select in every widget can switch option without crashing', () => {
    for (const [, Widget] of WIDGETS) {
      const { container, unmount } = render(<Widget />)
      for (const sel of container.querySelectorAll('select')) {
        for (const opt of sel.querySelectorAll('option')) {
          fireEvent.change(sel, { target: { value: opt.value } })
        }
      }
      unmount()
    }
  })

  it('NMS at 0.50 deletes the duplicates AND the occluded object', () => {
    const { container, getByText } = render(<NMSWidget />)
    expect(container.textContent).toContain('candidates = 6')
    fireEvent.click(getByText('run all'))
    // A wins its cluster; F is a real object wrongly suppressed at IoU 0.556;
    // G overlaps nothing, so NMS cannot remove it — only the score cut can.
    expect(container.textContent).toMatch(/kept = A, E, G/)
    expect(container.textContent).toContain('after NMS = 3')
  })

  it('raising the NMS threshold recovers the occluded object', () => {
    const { container } = render(<NMSWidget />)
    const iouSlider = container.querySelectorAll('input[type="range"]')[0]
    fireEvent.change(iouSlider, { target: { value: '0.6' } })
    fireEvent.click(screen.getByText('run all'))
    expect(container.textContent).toMatch(/kept = A, E, F, G/)
  })

  it('SSD pyramid reports the published 8,732 default boxes', () => {
    const { container } = render(<SSDPyramidWidget />)
    expect(container.textContent).toContain('8,732')
  })

  it('YOLO grid shows the v1 7×7×30 tensor by default', () => {
    const { container } = render(<YOLOGridWidget />)
    expect(container.textContent).toContain('7×7×30')
    expect(container.textContent).toContain('1,470')
  })

  it('IoU widget recomputes when a preset is clicked', () => {
    const { container } = render(<IoUWidget />)
    const before = container.textContent
    fireEvent.click(screen.getByRole('button', { name: 'miss' }))
    expect(container.textContent).not.toBe(before)
    expect(container.textContent).toContain('0.0000')     // disjoint boxes → IoU exactly 0
    expect(container.textContent).toContain('FP')
  })

  it('detection-metric widget reproduces the AP of 0.6833', () => {
    const { container } = render(<DetectionMetricWidget />)
    expect(container.textContent).toContain('0.6833')
  })
})
