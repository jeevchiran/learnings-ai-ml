import{u as t,j as s,B as i,C as r,D as l,a as c,Q as h,M as d}from"./index-VIW80S6x.js";function a(n){const e={annotation:"annotation",code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",math:"math",mi:"mi",mn:"mn",mo:"mo",mover:"mover",mrow:"mrow",msub:"msub",p:"p",path:"path",pre:"pre",semantics:"semantics",span:"span",strong:"strong",svg:"svg",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...t(),...n.components};return s.jsxs(s.Fragment,{children:[s.jsx(e.h1,{children:"Module 13: Time Series & Sequence Classification"}),`
`,s.jsx(i,{children:s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"From Module 12:"})," the four sequence patterns are clear. Now let's put them into practice with two concrete use cases — time-series forecasting and sequence classification — with complete PyTorch code you can run and adapt."]})}),`
`,s.jsx(e.h2,{children:"Use case 1 — Time-series forecasting"}),`
`,s.jsxs(e.p,{children:["Given the last ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsx(e.mi,{children:"T"})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"T"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6833em"}}),s.jsx(e.span,{className:"mord mathnormal",style:{marginRight:"0.1389em"},children:"T"})]})})]})," observations of a univariate signal, predict the next ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsx(e.mi,{children:"k"})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"k"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6944em"}}),s.jsx(e.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"})]})})]})," values."]}),`
`,s.jsxs(e.p,{children:[s.jsx(e.strong,{children:"Example:"})," 30 days of daily sales → forecast next 7 days."]}),`
`,s.jsx(e.h3,{children:"Architecture"}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`import torch
import torch.nn as nn

class TimeSeriesLSTM(nn.Module):
    def __init__(self, input_size=1, hidden=64, num_layers=2,
                 forecast_horizon=7, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )
        self.fc = nn.Linear(hidden, forecast_horizon)

    def forward(self, x):
        # x: (batch, seq_len, input_size)
        out, (h_n, _) = self.lstm(x)
        # Use final hidden state for many-to-one prediction
        return self.fc(h_n[-1])   # h_n[-1]: last layer's final state
`})}),`
`,s.jsx(e.h3,{children:"Training loop"}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`model = TimeSeriesLSTM(input_size=1, hidden=64, forecast_horizon=7)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.MSELoss()

for epoch in range(100):
    model.train()
    for x_batch, y_batch in train_loader:
        # x_batch: (batch, 30, 1), y_batch: (batch, 7)
        optimizer.zero_grad()
        pred = model(x_batch)
        loss = criterion(pred, y_batch)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
`})}),`
`,s.jsx(e.h3,{children:"Data preparation — sliding window"}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`def create_windows(series, window=30, horizon=7):
    """Create (input, target) pairs via sliding window."""
    X, Y = [], []
    for i in range(len(series) - window - horizon + 1):
        X.append(series[i : i + window])
        Y.append(series[i + window : i + window + horizon])
    return torch.tensor(X).float().unsqueeze(-1), torch.tensor(Y).float()

# Normalise before windowing (critical for LSTM convergence)
mean, std = series.mean(), series.std()
series_norm = (series - mean) / std
X, Y = create_windows(series_norm, window=30, horizon=7)
`})}),`
`,s.jsx(r,{title:"Normalisation is critical for time series",children:s.jsx(e.p,{children:"LSTMs are sensitive to input scale. If your signal ranges from 0 to 10,000, the weight matrices must compensate — this makes optimisation harder. Always normalise to zero mean and unit variance (z-score), or scale to [0, 1]. The forecast outputs will be in normalised space; multiply by std and add mean to recover the original scale."})}),`
`,s.jsx(e.h2,{children:"Use case 2 — Sequence classification"}),`
`,s.jsx(e.p,{children:"Classify an entire sequence into a discrete category. Example: classify whether an ECG recording shows normal rhythm, atrial fibrillation, or other anomaly."}),`
`,s.jsx(e.h3,{children:"Architecture"}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`class SequenceClassifier(nn.Module):
    def __init__(self, input_dim, hidden=128, num_layers=2,
                 num_classes=3, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden, num_layers,
                            batch_first=True, dropout=dropout,
                            bidirectional=True)
        # Bidirectional: each direction has 'hidden' units → 2*hidden total
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(2 * hidden, num_classes)

    def forward(self, x, lengths=None):
        if lengths is not None:
            from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence
            packed = pack_padded_sequence(x, lengths.cpu(),
                                          batch_first=True, enforce_sorted=False)
            out_packed, (h_n, _) = self.lstm(packed)
            out, _ = pad_packed_sequence(out_packed, batch_first=True)
        else:
            out, (h_n, _) = self.lstm(x)

        # h_n: (num_layers * 2, batch, hidden) for bidirectional
        # Take the last layer's forward and backward hidden states
        h_fwd = h_n[-2]   # forward, last layer
        h_bwd = h_n[-1]   # backward, last layer
        h = torch.cat([h_fwd, h_bwd], dim=-1)   # (batch, 2*hidden)
        return self.fc(self.dropout(h))
`})}),`
`,s.jsx(e.h3,{children:"Training with class imbalance handling"}),`
`,s.jsx(e.pre,{children:s.jsx(e.code,{className:"language-python",children:`# If classes are imbalanced, weight the loss
class_counts = torch.tensor([1000, 200, 300], dtype=torch.float)
class_weights = 1.0 / class_counts
class_weights /= class_weights.sum()

criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))

def train_epoch(model, loader, optimizer):
    model.train()
    total_loss, correct, total = 0, 0, 0
    for x, lengths, labels in loader:
        x, labels = x.to(device), labels.to(device)
        optimizer.zero_grad()
        logits = model(x, lengths)
        loss = criterion(logits, labels)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total_loss += loss.item()
        correct += (logits.argmax(1) == labels).sum().item()
        total += labels.shape[0]
    return total_loss / len(loader), correct / total
`})}),`
`,s.jsx(e.h2,{children:"Common failure modes and fixes"}),`
`,s.jsxs(e.table,{children:[s.jsx(e.thead,{children:s.jsxs(e.tr,{children:[s.jsx(e.th,{children:"Symptom"}),s.jsx(e.th,{children:"Cause"}),s.jsx(e.th,{children:"Fix"})]})}),s.jsxs(e.tbody,{children:[s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Loss NaN after a few steps"}),s.jsx(e.td,{children:"Exploding gradients"}),s.jsxs(e.td,{children:["Add ",s.jsx(e.code,{children:"clip_grad_norm_"})," with max_norm=1.0"]})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Model predicts same class always"}),s.jsx(e.td,{children:"Class imbalance"}),s.jsxs(e.td,{children:["Use ",s.jsx(e.code,{children:"CrossEntropyLoss(weight=...)"})]})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Good train loss, bad val loss"}),s.jsx(e.td,{children:"Overfitting"}),s.jsx(e.td,{children:"Add dropout, reduce num_layers or hidden size"})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Very slow convergence"}),s.jsx(e.td,{children:"Input not normalised"}),s.jsx(e.td,{children:"Z-score normalise input features"})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Worse than baseline"}),s.jsx(e.td,{children:"Sequence too short"}),s.jsx(e.td,{children:"Try CNN or MLP instead — RNN overhead may not pay"})]})]})]}),`
`,s.jsx(e.h2,{children:"When NOT to use an LSTM"}),`
`,s.jsxs(e.table,{children:[s.jsx(e.thead,{children:s.jsxs(e.tr,{children:[s.jsx(e.th,{children:"Situation"}),s.jsx(e.th,{children:"Better choice"})]})}),s.jsxs(e.tbody,{children:[s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Sequence length < 10"}),s.jsx(e.td,{children:"MLP or CNN — RNN overhead doesn't pay"})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Fixed-length, no temporal structure"}),s.jsx(e.td,{children:"MLP"})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Very long sequences (>500)"}),s.jsx(e.td,{children:"Transformer with attention"})]}),s.jsxs(e.tr,{children:[s.jsx(e.td,{children:"Tabular data with no time dimension"}),s.jsx(e.td,{children:"Gradient boosted trees"})]})]})]}),`
`,s.jsx(e.hr,{}),`
`,s.jsx(l,{children:s.jsxs(c,{number:1,title:"Why bidirectional helps sequence classification",children:[s.jsxs(e.p,{children:["For a many-to-one task, we use the final hidden state. The forward RNN's final state ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsxs(e.msub,{children:[s.jsxs(e.mover,{accent:"true",children:[s.jsx(e.mi,{mathvariant:"bold",children:"h"}),s.jsx(e.mo,{stretchy:"true",children:"→"})]}),s.jsx(e.mi,{children:"T"})]})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"\\overrightarrow{\\mathbf{h}}_T"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"1.3664em",verticalAlign:"-0.15em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord accent",children:s.jsx(e.span,{className:"vlist-t",children:s.jsx(e.span,{className:"vlist-r",children:s.jsxs(e.span,{className:"vlist",style:{height:"1.2164em"},children:[s.jsxs(e.span,{style:{top:"-3em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"mord mathbf",children:"h"})]}),s.jsxs(e.span,{className:"svg-align",style:{top:"-3.6944em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:s.jsx(e.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMaxYMin slice",children:s.jsx(e.path,{d:`M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z`})})})]})]})})})}),s.jsx(e.span,{className:"msupsub",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsx(e.span,{className:"vlist",style:{height:"0.3283em"},children:s.jsxs(e.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mathnormal mtight",style:{marginRight:"0.1389em"},children:"T"})})]})}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.15em"},children:s.jsx(e.span,{})})})]})})]})]})})]})," has seen all tokens left-to-right — but tokens near ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsx(e.mi,{children:"T"})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"T"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"0.6833em"}}),s.jsx(e.span,{className:"mord mathnormal",style:{marginRight:"0.1389em"},children:"T"})]})})]})," are most recent in its memory, and tokens near 1 may have faded (vanishing gradient). The backward RNN's state ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsx(e.mrow,{children:s.jsxs(e.msub,{children:[s.jsxs(e.mover,{accent:"true",children:[s.jsx(e.mi,{mathvariant:"bold",children:"h"}),s.jsx(e.mo,{stretchy:"true",children:"←"})]}),s.jsx(e.mn,{children:"1"})]})}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"\\overleftarrow{\\mathbf{h}}_1"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"1.3664em",verticalAlign:"-0.15em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord accent",children:s.jsx(e.span,{className:"vlist-t",children:s.jsx(e.span,{className:"vlist-r",children:s.jsxs(e.span,{className:"vlist",style:{height:"1.2164em"},children:[s.jsxs(e.span,{style:{top:"-3em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"mord mathbf",children:"h"})]}),s.jsxs(e.span,{className:"svg-align",style:{top:"-3.6944em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:s.jsx(e.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMinYMin slice",children:s.jsx(e.path,{d:`M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z`})})})]})]})})})}),s.jsx(e.span,{className:"msupsub",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsx(e.span,{className:"vlist",style:{height:"0.3011em"},children:s.jsxs(e.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mtight",children:"1"})})]})}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.15em"},children:s.jsx(e.span,{})})})]})})]})]})})]})," has seen all tokens right-to-left — tokens near 1 are most recent for it."]}),s.jsxs(e.p,{children:["Concatenating ",s.jsxs(e.span,{className:"katex",children:[s.jsx(e.span,{className:"katex-mathml",children:s.jsx(e.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:s.jsxs(e.semantics,{children:[s.jsxs(e.mrow,{children:[s.jsx(e.mo,{stretchy:"false",children:"["}),s.jsxs(e.msub,{children:[s.jsxs(e.mover,{accent:"true",children:[s.jsx(e.mi,{mathvariant:"bold",children:"h"}),s.jsx(e.mo,{stretchy:"true",children:"→"})]}),s.jsx(e.mi,{children:"T"})]}),s.jsx(e.mo,{separator:"true",children:";"}),s.jsxs(e.msub,{children:[s.jsxs(e.mover,{accent:"true",children:[s.jsx(e.mi,{mathvariant:"bold",children:"h"}),s.jsx(e.mo,{stretchy:"true",children:"←"})]}),s.jsx(e.mn,{children:"1"})]}),s.jsx(e.mo,{stretchy:"false",children:"]"})]}),s.jsx(e.annotation,{encoding:"application/x-tex",children:"[\\overrightarrow{\\mathbf{h}}_T; \\overleftarrow{\\mathbf{h}}_1]"})]})})}),s.jsx(e.span,{className:"katex-html","aria-hidden":"true",children:s.jsxs(e.span,{className:"base",children:[s.jsx(e.span,{className:"strut",style:{height:"1.4664em",verticalAlign:"-0.25em"}}),s.jsx(e.span,{className:"mopen",children:"["}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord accent",children:s.jsx(e.span,{className:"vlist-t",children:s.jsx(e.span,{className:"vlist-r",children:s.jsxs(e.span,{className:"vlist",style:{height:"1.2164em"},children:[s.jsxs(e.span,{style:{top:"-3em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"mord mathbf",children:"h"})]}),s.jsxs(e.span,{className:"svg-align",style:{top:"-3.6944em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:s.jsx(e.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMaxYMin slice",children:s.jsx(e.path,{d:`M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z`})})})]})]})})})}),s.jsx(e.span,{className:"msupsub",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsx(e.span,{className:"vlist",style:{height:"0.3283em"},children:s.jsxs(e.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mathnormal mtight",style:{marginRight:"0.1389em"},children:"T"})})]})}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.15em"},children:s.jsx(e.span,{})})})]})})]}),s.jsx(e.span,{className:"mpunct",children:";"}),s.jsx(e.span,{className:"mspace",style:{marginRight:"0.1667em"}}),s.jsxs(e.span,{className:"mord",children:[s.jsx(e.span,{className:"mord accent",children:s.jsx(e.span,{className:"vlist-t",children:s.jsx(e.span,{className:"vlist-r",children:s.jsxs(e.span,{className:"vlist",style:{height:"1.2164em"},children:[s.jsxs(e.span,{style:{top:"-3em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"mord mathbf",children:"h"})]}),s.jsxs(e.span,{className:"svg-align",style:{top:"-3.6944em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"3em"}}),s.jsx(e.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:s.jsx(e.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMinYMin slice",children:s.jsx(e.path,{d:`M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z`})})})]})]})})})}),s.jsx(e.span,{className:"msupsub",children:s.jsxs(e.span,{className:"vlist-t vlist-t2",children:[s.jsxs(e.span,{className:"vlist-r",children:[s.jsx(e.span,{className:"vlist",style:{height:"0.3011em"},children:s.jsxs(e.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[s.jsx(e.span,{className:"pstrut",style:{height:"2.7em"}}),s.jsx(e.span,{className:"sizing reset-size6 size3 mtight",children:s.jsx(e.span,{className:"mord mtight",children:"1"})})]})}),s.jsx(e.span,{className:"vlist-s",children:"​"})]}),s.jsx(e.span,{className:"vlist-r",children:s.jsx(e.span,{className:"vlist",style:{height:"0.15em"},children:s.jsx(e.span,{})})})]})})]}),s.jsx(e.span,{className:"mclose",children:"]"})]})})]}),' gives a representation where both ends of the sequence are "recent" for one of the two directions. For classification tasks where the label depends on the whole sequence, this usually improves accuracy over a unidirectional LSTM.']})]})}),`
`,s.jsx(e.hr,{}),`
`,s.jsx(e.h2,{children:"Quiz"}),`
`,s.jsx(h,{question:"In the TimeSeriesLSTM, why is h_n[-1] used instead of the full output tensor for forecasting?",options:["h_n[-1] is faster to compute than the full output","For many-to-one forecasting, we want a single summary of the full sequence — the last layer's final hidden state — not per-step predictions","The full output contains hidden states from all layers, which would be too large for the linear layer","h_n[-1] automatically accounts for padding while the full output does not"],correct:1}),`
`,s.jsx(d,{question:"Which of these preprocessing steps are important when using an LSTM for time-series data?",options:["Z-score normalisation of input features to zero mean and unit variance","Creating sliding window pairs (input window, forecast horizon) from the raw time series","Sorting all sequences by their value before feeding to the LSTM","Gradient clipping to prevent exploding gradients during training","Using teacher forcing during inference to improve forecast accuracy"],correct:[0,1,3]})]})}function m(n={}){const{wrapper:e}={...t(),...n.components};return e?s.jsx(e,{...n,children:s.jsx(a,{...n})}):a(n)}export{m as default};
