/* Computer Vision widgets' presentational layer.
 *
 * The primitives now live in ../shared/ui.jsx so the transfer-learning track
 * can reuse them. This file stays as the CV entry point: it re-exports them
 * unchanged, so none of the twenty CV widgets needed editing. The shared
 * default accent is already this track's green.
 */

export {
  box, Row, Select, Slider, Toggle, Btn, Caption,
  grey, svgPoint, PixelGrid, KernelGrid, Readout,
  Accent, useAccent,
} from '../shared/ui.jsx'
