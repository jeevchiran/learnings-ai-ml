import{u as a,j as e,C as t,B as r,R as o,Q as l}from"./index-Ba5-wm3B.js";function i(n){const s={annotation:"annotation",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",math:"math",mi:"mi",mn:"mn",mrow:"mrow",msup:"msup",mtext:"mtext",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...a(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{children:"Module 12: Demonstration — U-Net in PyTorch"}),`
`,e.jsx(t,{title:"TL;DR",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["A full U-Net is about ",e.jsx(s.strong,{children:"60 lines"}),": a ",e.jsx(s.code,{children:"DoubleConv"})," block, a down path, an up path with ",e.jsx(s.code,{children:"torch.cat"}),", and a 1×1 head."]}),`
`,e.jsxs(s.li,{children:["Build it ",e.jsx(s.strong,{children:"shape-first"}),". Run a random tensor through before you touch a dataset — every U-Net bug is a shape bug."]}),`
`,e.jsxs(s.li,{children:["Train with ",e.jsx(s.strong,{children:"BCE + soft Dice"}),", monitor ",e.jsx(s.strong,{children:"Dice on the validation set"}),", not the loss."]}),`
`,e.jsxs(s.li,{children:["Threshold at 0.5 to start, then ",e.jsx(s.strong,{children:"tune the threshold on validation"})," — it is free accuracy and almost everyone forgets."]}),`
`,e.jsx(s.li,{children:"The whole of this module runs in the track notebook, including the training loop and a Dice-vs-threshold sweep."}),`
`]})}),`
`,e.jsx(r,{children:e.jsx(s.p,{children:"Modules 6 through 11 built every component and the loss. This module assembles them into working code and trains it, so the architecture stops being a diagram."})}),`
`,e.jsx(s.h2,{children:"The model"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import torch, torch.nn as nn, torch.nn.functional as F

class DoubleConv(nn.Module):
    """(conv 3x3 → BN → ReLU) x 2 — the block repeated at every U-Net level.
    Padding=1 keeps the spatial size, so no cropping is needed later."""
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch,  out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch), nn.ReLU(inplace=True),
        )
    def forward(self, x): return self.net(x)


class UNet(nn.Module):
    def __init__(self, in_ch=3, classes=1, base=32, depth=4):
        super().__init__()
        self.downs = nn.ModuleList()
        self.ups   = nn.ModuleList()
        self.pool  = nn.MaxPool2d(2)

        # contracting path
        ch = in_ch
        for d in range(depth):
            self.downs.append(DoubleConv(ch, base * 2**d))
            ch = base * 2**d

        self.bottleneck = DoubleConv(ch, ch * 2)

        # expanding path: an up-conv then a DoubleConv, per level
        for d in reversed(range(depth)):
            out = base * 2**d
            self.ups.append(nn.ConvTranspose2d(out * 2, out, kernel_size=2, stride=2))
            self.ups.append(DoubleConv(out * 2, out))   # out (upsampled) + out (skip)

        self.head = nn.Conv2d(base, classes, kernel_size=1)

    def forward(self, x):
        skips = []
        for down in self.downs:
            x = down(x)
            skips.append(x)          # save BEFORE pooling — full resolution
            x = self.pool(x)

        x = self.bottleneck(x)
        skips = skips[::-1]          # deepest first

        for i in range(0, len(self.ups), 2):
            x = self.ups[i](x)                       # up-conv
            skip = skips[i // 2]
            if x.shape[-2:] != skip.shape[-2:]:      # odd input sizes drift by a pixel
                x = F.interpolate(x, size=skip.shape[-2:], mode='bilinear', align_corners=False)
            x = torch.cat([skip, x], dim=1)          # concat on the channel axis
            x = self.ups[i + 1](x)                   # DoubleConv

        return self.head(x)                          # raw logits — no sigmoid here
`})}),`
`,e.jsxs(t,{title:"Check the shapes before anything else",children:[e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`m = UNet(in_ch=3, classes=1, base=32)
x = torch.randn(2, 3, 256, 256)
print(m(x).shape)                                   # torch.Size([2, 1, 256, 256])
print(f'{sum(p.numel() for p in m.parameters()):,} parameters')
`})}),e.jsx(s.p,{children:"If this line does not produce a tensor the same height and width as the input, nothing downstream will work and every error you get will be confusing. Two rules that prevent most of it:"}),e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Save the skip ",e.jsx(s.strong,{children:"before"})," pooling, not after."]}),`
`,e.jsxs(s.li,{children:["Use input sizes divisible by ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsxs(s.msup,{children:[e.jsx(s.mn,{children:"2"}),e.jsx(s.mtext,{children:"depth"})]})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"2^{\\text{depth}}"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.8491em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord",children:"2"}),e.jsx(s.span,{className:"msupsub",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.8491em"},children:e.jsxs(s.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:e.jsx(s.span,{className:"mord text mtight",children:e.jsx(s.span,{className:"mord mtight",children:"depth"})})})})]})})})})})]})]})})]})," — 256 with depth 4 is fine, 250 is not. The ",e.jsx(s.code,{children:"F.interpolate"})," guard above handles the rest."]}),`
`]}),e.jsxs(s.p,{children:["Returning ",e.jsx(s.strong,{children:"logits"})," (no sigmoid) is deliberate: ",e.jsx(s.code,{children:"BCEWithLogitsLoss"})," is numerically stabler than ",e.jsx(s.code,{children:"sigmoid"})," followed by ",e.jsx(s.code,{children:"BCELoss"}),", and the Dice term applies its own sigmoid."]})]}),`
`,e.jsx(s.h2,{children:"Loss and metric"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def soft_dice_loss(logits, targets, eps=1.0):
    probs = torch.sigmoid(logits)
    dims  = (1, 2, 3)                                  # per image, then mean
    inter = (probs * targets).sum(dims)
    denom = probs.sum(dims) + targets.sum(dims)
    return 1 - ((2 * inter + eps) / (denom + eps)).mean()

bce = nn.BCEWithLogitsLoss()
def criterion(logits, targets):
    return 0.5 * bce(logits, targets) + 0.5 * soft_dice_loss(logits, targets)

@torch.no_grad()
def dice_score(logits, targets, thr=0.5, eps=1e-7):
    """The METRIC: hard masks, per image, averaged. Not the loss."""
    preds = (torch.sigmoid(logits) > thr).float()
    dims  = (1, 2, 3)
    inter = (preds * targets).sum(dims)
    denom = preds.sum(dims) + targets.sum(dims)
    return ((2 * inter + eps) / (denom + eps)).mean().item()
`})}),`
`,e.jsx(s.h2,{children:"Training loop"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`model = UNet(in_ch=3, classes=1, base=32).to(DEVICE)
opt   = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=EPOCHS)

best = 0.0
for ep in range(EPOCHS):
    model.train()
    for x, y in train_loader:
        x, y = x.to(DEVICE), y.to(DEVICE)
        loss = criterion(model(x), y)
        opt.zero_grad(); loss.backward(); opt.step()
    sched.step()

    model.eval()
    scores = []
    with torch.no_grad():
        for x, y in val_loader:
            scores.append(dice_score(model(x.to(DEVICE)), y.to(DEVICE)))
    val_dice = sum(scores) / len(scores)
    print(f'ep {ep:>2}  loss {loss.item():.4f}  val Dice {val_dice:.4f}')

    if val_dice > best:                       # select on the METRIC, never the loss
        best = val_dice
        torch.save(model.state_dict(), 'unet_best.pt')
`})}),`
`,e.jsx(s.h2,{children:"The threshold sweep almost everyone skips"}),`
`,e.jsx(s.p,{children:"0.5 is a default, not an answer. The optimal threshold depends on your class balance and on whether false positives or false negatives cost more:"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import numpy as np

@torch.no_grad()
def sweep(model, loader, thresholds=np.arange(0.1, 0.91, 0.05)):
    logits, targets = [], []
    for x, y in loader:
        logits.append(model(x.to(DEVICE)).cpu()); targets.append(y)
    logits, targets = torch.cat(logits), torch.cat(targets)
    return {round(float(t), 2): dice_score(logits, targets, thr=float(t)) for t in thresholds}

for t, d in sweep(model, val_loader).items():
    print(f'threshold {t:.2f} → Dice {d:.4f}')
`})}),`
`,e.jsx(s.p,{children:"On imbalanced data the best threshold is routinely 0.3–0.4 rather than 0.5, and moving it is worth several points of Dice for zero training cost."}),`
`,e.jsx(s.h2,{children:"Debugging table"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Symptom"}),e.jsx(s.th,{children:"Likely cause"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Output size ≠ input size"}),e.jsxs(s.td,{children:["skip saved after pooling, or input not divisible by ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsxs(s.msup,{children:[e.jsx(s.mn,{children:"2"}),e.jsx(s.mtext,{children:"depth"})]})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"2^{\\text{depth}}"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.8491em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord",children:"2"}),e.jsx(s.span,{className:"msupsub",children:e.jsx(s.span,{className:"vlist-t",children:e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.8491em"},children:e.jsxs(s.span,{style:{top:"-3.063em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsx(s.span,{className:"mord mtight",children:e.jsx(s.span,{className:"mord text mtight",children:e.jsx(s.span,{className:"mord mtight",children:"depth"})})})})]})})})})})]})]})})]})]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Loss falls, Dice stays ~0"}),e.jsx(s.td,{children:"predicting all background — imbalance; check the Dice term is actually in the loss"})]}),e.jsxs(s.tr,{children:[e.jsxs(s.td,{children:[e.jsx(s.code,{children:"nan"})," loss"]}),e.jsxs(s.td,{children:["missing ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"ϵ"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\epsilon"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"ϵ"})]})})]})," in soft Dice, or an all-empty target batch"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Masks correct but blurry"}),e.jsx(s.td,{children:"skips not connected, or concatenating on the wrong axis"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Train Dice ≫ val Dice"}),e.jsxs(s.td,{children:["overfitting — lower ",e.jsx(s.code,{children:"base"}),", augment harder, or use a pretrained encoder"]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:"Val Dice swings wildly"}),e.jsx(s.td,{children:"batch too small for BatchNorm; use GroupNorm or accumulate gradients"})]})]})]}),`
`,e.jsx(s.hr,{}),`
`,e.jsx(o,{items:[{q:"Why must the skip be saved before the pooling step rather than after?",a:"Because the whole point of the skip is to carry full-resolution spatial information across the bottleneck. Saving after pooling would hand the decoder a map that has already lost half its resolution — exactly the information the skip exists to preserve — and the output would be blurry despite the architecture looking correct."},{q:"Why does the model return raw logits instead of applying a sigmoid?",a:"Numerical stability and separation of concerns. BCEWithLogitsLoss fuses the sigmoid with the loss using the log-sum-exp trick, which is stabler than sigmoid followed by BCELoss, and the Dice term applies its own sigmoid. Applying sigmoid inside forward would double-apply it in the loss and quietly degrade training."},{q:"Why select the best checkpoint on validation Dice rather than on validation loss?",a:"Because the loss is a differentiable surrogate and the Dice score is what you actually care about. They can diverge — a model can lower the combined BCE-plus-Dice loss while its thresholded masks get worse, particularly around the decision boundary. Always checkpoint on the metric you will be judged by."},{q:"What does a threshold sweep typically buy, and why is 0.5 often wrong?",a:"Several points of Dice at zero training cost. 0.5 is only optimal when the predicted probabilities are calibrated and the classes balanced; with heavy foreground imbalance the model is systematically under-confident about the rare class, so a lower threshold around 0.3 to 0.4 usually scores better. Tune it on validation, not test."},{q:"Loss is falling but validation Dice sits near zero. What is happening?",a:"The model is predicting background everywhere. Cross-entropy is happy with that under imbalance, so the loss keeps dropping while every thresholded mask is empty and Dice stays at zero. Check that the Dice term is actually contributing to the loss and consider a pos_weight on the BCE term."}]}),`
`,e.jsx(l,{question:"Your UNet(base=32, depth=4) returns a 248×248 output for a 250×250 input. What is the most likely cause?",options:["The 1×1 head is reducing the size","250 is not divisible by 2⁴ = 16, so pooling truncates and the up path cannot restore the exact size","BatchNorm removes a pixel border","ConvTranspose2d always loses two pixels"],correct:1})]})}function h(n={}){const{wrapper:s}={...a(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}export{h as default};
