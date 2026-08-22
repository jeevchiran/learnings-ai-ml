import{u as l,j as e,B as h,R as a,C as i,D as c,a as o,Q as d,M as m}from"./index-Ba5-wm3B.js";import{P as t}from"./PredictReveal-CQqAapoB.js";function r(n){const s={annotation:"annotation",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mover:"mover",mrow:"mrow",msub:"msub",p:"p",path:"path",pre:"pre",semantics:"semantics",span:"span",strong:"strong",svg:"svg",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...l(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{children:"Module 13: Time Series & Sequence Classification"}),`
`,e.jsx(h,{children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"From Module 12:"})," the four sequence patterns are clear. Now let's put them into practice with two concrete use cases — time-series forecasting and sequence classification — with complete PyTorch code you can run and adapt."]})}),`
`,e.jsx(s.h2,{children:"Use case 1 — Time-series forecasting"}),`
`,e.jsxs(s.p,{children:["Given the last ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"T"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"T"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.1389em"},children:"T"})]})})]})," observations of a univariate signal, predict the next ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"k"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"k"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6944em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0315em"},children:"k"})]})})]})," values."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Example:"})," 30 days of daily sales → forecast next 7 days."]}),`
`,e.jsx(s.h3,{children:"Architecture"}),`
`,e.jsxs(t,{prompt:"For many-to-one forecasting — predicting the next k values from a full input window — should the model read out from the LSTM's final hidden state, or from the output at every timestep?",options:["The final hidden state, h_n[-1]","The output at every timestep","The average of all timestep outputs"],correct:0,children:[e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import torch
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
`})}),e.jsxs(s.p,{children:["A many-to-one head only needs one summary of the whole window, not a prediction at every step along the way — so ",e.jsx(s.code,{children:"h_n[-1]"}),", the last layer's final hidden state, is exactly the right shape to feed the linear layer."]})]}),`
`,e.jsx(s.h3,{children:"Training loop"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`model = TimeSeriesLSTM(input_size=1, hidden=64, forecast_horizon=7)
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
`,e.jsx(a,{items:[{q:"Why is gradient clipping routine rather than exceptional in time-series RNNs?",a:"Because input windows are often long, so BPTT chains many recurrent Jacobians, and time-series data frequently contains spikes that produce large loss values. Both conditions favour the exploding half of Module 9's product. Clipping costs almost nothing and removes an entire class of training failure."}]}),`
`,e.jsx(s.h3,{children:"Data preparation — sliding window"}),`
`,e.jsxs(t,{prompt:"You fit the normalisation mean and std on the entire series, including the period that will later become your validation set, then split. What goes wrong?",options:["Nothing — normalisation stats do not depend on the split","Future statistics leak into training, so validation looks better than the model really is","The model trains slower but converges to the same result"],correct:1,children:[e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def create_windows(series, window=30, horizon=7):
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
`})}),e.jsx(i,{title:"Normalisation is critical for time series",children:e.jsx(s.p,{children:"LSTMs are sensitive to input scale. If your signal ranges from 0 to 10,000, the weight matrices must compensate — this makes optimisation harder. Always normalise to zero mean and unit variance (z-score), or scale to [0, 1]. The forecast outputs will be in normalised space; multiply by std and add mean to recover the original scale."})}),e.jsxs(s.p,{children:["The fix: fit ",e.jsx(s.code,{children:"mean"}),"/",e.jsx(s.code,{children:"std"})," on the training segment only, then apply that same scaler to validation and test. Whatever you fit on before splitting has already seen the future."]})]}),`
`,e.jsx(a,{items:[{q:"How does one long time series become a supervised training set?",a:"By sliding a window along it: each position yields an input of the previous T observations paired with a target of the next k. A 1,000-point series with T=30 and k=7 gives roughly 960 training pairs from a single sequence — which is why forecasting works at all with limited data."},{q:"You normalise the whole series before splitting. What have you done?",a:"Leaked future information into the past. The mean and standard deviation were computed using test-period values, so every training input was scaled with knowledge of data that had not happened yet. Fit the scaler on the training segment only and apply it to the later segments."},{q:"Why is 'sort the sequences by value' a nonsensical preprocessing step here?",a:"Because the temporal ordering IS the signal. Sorting rearranges the series into a monotone curve, destroying trend, seasonality and every lag relationship the model exists to learn. Shuffling the ORDER OF SEQUENCES in a batch is fine and desirable; reordering within a sequence is not."},{q:"Could you use teacher forcing at inference to improve forecasts?",a:"No — that would require the true future values, which are precisely what you are predicting. Feeding them in would produce impressive-looking numbers that measure nothing. Teacher forcing is a training-time stabiliser only; at inference the model must consume its own outputs."}]}),`
`,e.jsx(s.h2,{children:"Use case 2 — Sequence classification"}),`
`,e.jsx(s.p,{children:"Classify an entire sequence into a discrete category. Example: classify whether an ECG recording shows normal rhythm, atrial fibrillation, or other anomaly."}),`
`,e.jsx(s.h3,{children:"Architecture"}),`
`,e.jsxs(t,{prompt:"This LSTM is bidirectional with num_layers=2, so h_n has shape (num_layers * 2, batch, hidden). Which indices give the last layer's forward and backward final states?",options:["h_n[0] and h_n[1]","h_n[-2] and h_n[-1]","There is no way to separate them — h_n mixes both directions together"],correct:1,children:[e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`class SequenceClassifier(nn.Module):
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
`})}),e.jsx(c,{children:e.jsxs(o,{number:1,title:"Why bidirectional helps sequence classification",children:[e.jsxs(s.p,{children:["For a many-to-one task, we use the final hidden state. The forward RNN's final state ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsxs(s.msub,{children:[e.jsxs(s.mover,{accent:"true",children:[e.jsx(s.mi,{mathvariant:"bold",children:"h"}),e.jsx(s.mo,{stretchy:"true",children:"→"})]}),e.jsx(s.mi,{children:"T"})]})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\overrightarrow{\\mathbf{h}}_T"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.3664em",verticalAlign:"-0.15em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord accent",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsxs(s.span,{className:"vlist",style:{height:"1.2164em"},children:[e.jsxs(s.span,{style:{top:"-3em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"mord mathbf",children:"h"})]}),e.jsxs(s.span,{className:"svg-align",style:{top:"-3.6944em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:e.jsx(s.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMaxYMin slice",children:e.jsx(s.path,{d:`M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z`})})})]})]})})})}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3283em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mathnormal mtight",style:{marginRight:"0.1389em"},children:"T"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]})]})})]})," has seen all tokens left-to-right — but tokens near ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"T"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"T"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.1389em"},children:"T"})]})})]})," are most recent in its memory, and tokens near 1 may have faded (vanishing gradient). The backward RNN's state ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsxs(s.msub,{children:[e.jsxs(s.mover,{accent:"true",children:[e.jsx(s.mi,{mathvariant:"bold",children:"h"}),e.jsx(s.mo,{stretchy:"true",children:"←"})]}),e.jsx(s.mn,{children:"1"})]})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\overleftarrow{\\mathbf{h}}_1"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.3664em",verticalAlign:"-0.15em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord accent",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsxs(s.span,{className:"vlist",style:{height:"1.2164em"},children:[e.jsxs(s.span,{style:{top:"-3em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"mord mathbf",children:"h"})]}),e.jsxs(s.span,{className:"svg-align",style:{top:"-3.6944em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:e.jsx(s.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMinYMin slice",children:e.jsx(s.path,{d:`M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z`})})})]})]})})})}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3011em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:"1"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]})]})})]})," has seen all tokens right-to-left — tokens near 1 are most recent for it."]}),e.jsxs(s.p,{children:["Concatenating ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mo,{stretchy:"false",children:"["}),e.jsxs(s.msub,{children:[e.jsxs(s.mover,{accent:"true",children:[e.jsx(s.mi,{mathvariant:"bold",children:"h"}),e.jsx(s.mo,{stretchy:"true",children:"→"})]}),e.jsx(s.mi,{children:"T"})]}),e.jsx(s.mo,{separator:"true",children:";"}),e.jsxs(s.msub,{children:[e.jsxs(s.mover,{accent:"true",children:[e.jsx(s.mi,{mathvariant:"bold",children:"h"}),e.jsx(s.mo,{stretchy:"true",children:"←"})]}),e.jsx(s.mn,{children:"1"})]}),e.jsx(s.mo,{stretchy:"false",children:"]"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"[\\overrightarrow{\\mathbf{h}}_T; \\overleftarrow{\\mathbf{h}}_1]"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1.4664em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mopen",children:"["}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord accent",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsxs(s.span,{className:"vlist",style:{height:"1.2164em"},children:[e.jsxs(s.span,{style:{top:"-3em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"mord mathbf",children:"h"})]}),e.jsxs(s.span,{className:"svg-align",style:{top:"-3.6944em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:e.jsx(s.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMaxYMin slice",children:e.jsx(s.path,{d:`M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z`})})})]})]})})})}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3283em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mathnormal mtight",style:{marginRight:"0.1389em"},children:"T"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]}),e.jsx(s.span,{className:"mpunct",children:";"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord accent",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsxs(s.span,{className:"vlist",style:{height:"1.2164em"},children:[e.jsxs(s.span,{style:{top:"-3em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"mord mathbf",children:"h"})]}),e.jsxs(s.span,{className:"svg-align",style:{top:"-3.6944em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"3em"}}),e.jsx(s.span,{className:"hide-tail",style:{height:"0.522em",minWidth:"0.888em"},children:e.jsx(s.svg,{xmlns:"http://www.w3.org/2000/svg",width:"400em",height:"0.522em",viewBox:"0 0 400000 522",preserveAspectRatio:"xMinYMin slice",children:e.jsx(s.path,{d:`M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z`})})})]})]})})})}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3011em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"0em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:"1"})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]}),e.jsx(s.span,{className:"mclose",children:"]"})]})})]}),' gives a representation where both ends of the sequence are "recent" for one of the two directions. For classification tasks where the label depends on the whole sequence, this usually improves accuracy over a unidirectional LSTM.']})]})})]}),`
`,e.jsx(s.h3,{children:"Training with class imbalance handling"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`# If classes are imbalanced, weight the loss
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
`,e.jsx(s.h2,{children:"Common failure modes and fixes"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Symptom"}),e.jsx(s.th,{children:"Cause"}),e.jsx(s.th,{children:"Fix"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Loss NaN after a few steps"}),e.jsx(s.td,{children:"Exploding gradients"}),e.jsxs(s.td,{children:["Add ",e.jsx(s.code,{children:"clip_grad_norm_"})," with max_norm=1.0"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Model predicts same class always"}),e.jsx(s.td,{children:"Class imbalance"}),e.jsxs(s.td,{children:["Use ",e.jsx(s.code,{children:"CrossEntropyLoss(weight=...)"})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Good train loss, bad val loss"}),e.jsx(s.td,{children:"Overfitting"}),e.jsx(s.td,{children:"Add dropout, reduce num_layers or hidden size"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Very slow convergence"}),e.jsx(s.td,{children:"Input not normalised"}),e.jsx(s.td,{children:"Z-score normalise input features"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Worse than baseline"}),e.jsx(s.td,{children:"Sequence too short"}),e.jsx(s.td,{children:"Try CNN or MLP instead — RNN overhead may not pay"})]})]})]}),`
`,e.jsx(s.h2,{children:"When NOT to use an LSTM"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Situation"}),e.jsx(s.th,{children:"Better choice"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Sequence length < 10"}),e.jsx(s.td,{children:"MLP or CNN — RNN overhead doesn't pay"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Fixed-length, no temporal structure"}),e.jsx(s.td,{children:"MLP"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Very long sequences (>500)"}),e.jsx(s.td,{children:"Transformer with attention"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Tabular data with no time dimension"}),e.jsx(s.td,{children:"Gradient boosted trees"})]})]})]}),`
`,e.jsx(s.hr,{}),`
`,e.jsx(i,{title:"TL;DR",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Forecasting is a ",e.jsx(s.strong,{children:"many→one"})," problem built from ",e.jsx(s.strong,{children:"sliding windows"}),": turn one long series into (input window, horizon) pairs."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Normalise inputs, and fit the scaler on training data only."})," Fitting on the whole series leaks future statistics into the past."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Never sort or shuffle within a sequence"})," — sorting by value destroys the exact signal you're modelling. Shuffling ",e.jsx(s.em,{children:"between"})," sequences is fine."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Gradient clipping is standard practice here"}),", not an emergency measure — long windows are exactly where exploding gradients appear."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Teacher forcing is a training-only device."})," Using ground truth at inference isn't a trick, it's leakage — the future isn't available."]}),`
`]})}),`
`,e.jsx(d,{question:"In the TimeSeriesLSTM, why is h_n[-1] used instead of the full output tensor for forecasting?",options:["h_n[-1] is faster to compute than the full output","For many-to-one forecasting, we want a single summary of the full sequence — the last layer's final hidden state — not per-step predictions","The full output contains hidden states from all layers, which would be too large for the linear layer","h_n[-1] automatically accounts for padding while the full output does not"],correct:1}),`
`,e.jsx(m,{question:"Which of these preprocessing steps are important when using an LSTM for time-series data?",options:["Z-score normalisation of input features to zero mean and unit variance","Creating sliding window pairs (input window, forecast horizon) from the raw time series","Sorting all sequences by their value before feeding to the LSTM","Gradient clipping to prevent exploding gradients during training","Using teacher forcing during inference to improve forecast accuracy"],correct:[0,1,3]})]})}function j(n={}){const{wrapper:s}={...l(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(r,{...n})}):r(n)}export{j as default};
