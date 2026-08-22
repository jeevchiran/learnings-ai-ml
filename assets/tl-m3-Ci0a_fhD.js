import{u as i,j as e,B as h,C as o,R as r,Q as l}from"./index-Ba5-wm3B.js";import{P as a}from"./PredictReveal-CQqAapoB.js";function s(t){const n={code:"code",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 3: Demonstration — Fine-Tuning a Backbone"}),`
`,e.jsx(h,{children:e.jsx(n.p,{children:"Modules 1 and 2 argued about where to cut and why. This module runs it — a complete, honest fine-tuning script with the measurements that tell you whether it worked. Everything here executes in the track notebook."})}),`
`,e.jsx(n.h2,{children:"The complete script"}),`
`,e.jsx(a,{prompt:"You load a pretrained ResNet-18, freeze every parameter, then replace the 1000-way head with a 10-way nn.Linear. What fraction of the model ends up trainable?",options:["About 50%","About 5%","About 0.05%"],correct:2,children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch, torch.nn as nn, torchvision
from torchvision import transforms

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
N_CLASSES = 10

# ── 1. Data. Note the ImageNet statistics — the backbone's input contract. ──
IMAGENET_MEAN, IMAGENET_STD = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]

train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(0.2, 0.2, 0.2),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])
eval_tf = transforms.Compose([
    transforms.Resize(256), transforms.CenterCrop(224),
    transforms.ToTensor(), transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])

# ── 2. Model: load pretrained, freeze, replace the head ──
def build(n_classes, freeze_backbone=True):
    m = torchvision.models.resnet18(weights='DEFAULT')
    if freeze_backbone:
        for p in m.parameters():
            p.requires_grad = False
    m.fc = nn.Linear(m.fc.in_features, n_classes)   # new head: requires_grad=True
    return m.to(DEVICE)

model = build(N_CLASSES)

def report(m):
    tr = sum(p.numel() for p in m.parameters() if p.requires_grad)
    to = sum(p.numel() for p in m.parameters())
    print(f'trainable {tr:,} / {to:,}  ({tr/to:.2%})')

report(model)      # 5,130 / 11,181,642  (0.05%)
                   # note the total is not 11.69M: replacing the 1000-way head
                   # with a 10-way one removed ~508k parameters.
`})})}),`
`,e.jsxs(o,{title:"Freeze BatchNorm too, or your frozen model is not frozen",children:[e.jsxs(n.p,{children:[e.jsx(n.code,{children:"requires_grad = False"})," stops gradients. It does ",e.jsx(n.strong,{children:"not"})," stop BatchNorm from updating ",e.jsx(n.code,{children:"running_mean"})," and ",e.jsx(n.code,{children:"running_var"}),', which happen during the forward pass. In phase 1 that means your "frozen" feature extractor changes between epochs.']}),e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def freeze_bn(module):
    for m in module.modules():
        if isinstance(m, nn.BatchNorm2d):
            m.eval()                      # stop the running statistics moving
            m.weight.requires_grad = False
            m.bias.requires_grad = False

# call AFTER model.train(), because .train() puts every BN back into training mode
model.train(); freeze_bn(model)
`})}),e.jsxs(n.p,{children:["The ordering matters: ",e.jsx(n.code,{children:"model.train()"})," resets every submodule, so ",e.jsx(n.code,{children:"freeze_bn"})," has to come after it, every epoch."]})]}),`
`,e.jsx(r,{items:[{q:"Why must freeze_bn be called after model.train() rather than once at setup?",a:"Because model.train() recursively puts every submodule, including every BatchNorm, back into training mode. Freezing BN once at setup is undone the first time you call .train() at the start of an epoch. The call has to be repeated after each .train() for the running statistics to actually stay fixed."}]}),`
`,e.jsx(n.h2,{children:"Two-phase training"}),`
`,e.jsx(a,{prompt:"Phase 2 unfreezes ResNet-18's layer4 for fine-tuning. Roughly what fraction of the model's parameters become trainable at that point?",options:["About 10%","About 45%","About 75%"],correct:2,children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def run_epoch(model, loader, optimizer=None):
    train = optimizer is not None
    model.train(train)
    if train: freeze_bn_if_phase1(model)
    total, correct, loss_sum = 0, 0, 0.0
    for x, y in loader:
        x, y = x.to(DEVICE), y.to(DEVICE)
        with torch.set_grad_enabled(train):
            out = model(x)
            loss = nn.functional.cross_entropy(out, y)
        if train:
            optimizer.zero_grad(); loss.backward(); optimizer.step()
        loss_sum += loss.item() * y.size(0)
        correct  += (out.argmax(1) == y).sum().item()
        total    += y.size(0)
    return loss_sum / total, correct / total

# ── PHASE 1: head only. Backbone frozen, high LR, a few epochs. ──
opt1 = torch.optim.AdamW(model.fc.parameters(), lr=1e-3, weight_decay=1e-4)
for ep in range(3):
    tr_loss, tr_acc = run_epoch(model, train_loader, opt1)
    va_loss, va_acc = run_epoch(model, val_loader)
    print(f'[head]  ep{ep}  train {tr_acc:.3f}  val {va_acc:.3f}')

# ── PHASE 2: unfreeze the last block, discriminative LRs, low backbone LR ──
for p in model.layer4.parameters():
    p.requires_grad = True
report(model)      # 8,398,858 / 11,181,642  (75%)  ← layer4 alone is 8.39M

opt2 = torch.optim.AdamW([
    {'params': model.layer4.parameters(), 'lr': 1e-4},
    {'params': model.fc.parameters(),     'lr': 1e-3},
], weight_decay=1e-4)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt2, T_max=8)

for ep in range(8):
    tr_loss, tr_acc = run_epoch(model, train_loader, opt2)
    va_loss, va_acc = run_epoch(model, val_loader)
    sched.step()
    print(f'[tune]  ep{ep}  train {tr_acc:.3f}  val {va_acc:.3f}')
`})})}),`
`,e.jsx(n.h2,{children:"The baselines that make the number mean something"}),`
`,e.jsx(n.p,{children:"A fine-tuned accuracy is meaningless on its own. Three cheap comparisons:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Baseline"}),e.jsx(n.th,{children:"What it tells you"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Majority class"})}),e.jsx(n.td,{children:"the floor. If your classes are 90/10, 90% accuracy is nothing."})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Linear probe on frozen features"})}),e.jsx(n.td,{children:"how much of the job the pretrained features already do"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:e.jsx(n.strong,{children:"Same architecture, random init"})}),e.jsx(n.td,{children:"whether pretraining helped at all (Module 1's negative-transfer check)"})]})]})]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Linear probe without any training loop: extract features once, fit sklearn.
from sklearn.linear_model import LogisticRegression

backbone = torchvision.models.resnet18(weights='DEFAULT')
backbone.fc = nn.Identity()                       # now it outputs the 512-d embedding
backbone.eval().to(DEVICE)

@torch.no_grad()
def features(loader):
    F, Y = [], []
    for x, y in loader:
        F.append(backbone(x.to(DEVICE)).cpu()); Y.append(y)
    return torch.cat(F).numpy(), torch.cat(Y).numpy()

Xtr, ytr = features(train_loader)
Xva, yva = features(val_loader)
probe = LogisticRegression(max_iter=2000).fit(Xtr, ytr)
print('linear probe val acc:', probe.score(Xva, yva))
`})}),`
`,e.jsxs(n.p,{children:["That ",e.jsx(n.code,{children:"nn.Identity()"})," trick is the bridge to the next module: ",e.jsx(n.strong,{children:"the backbone with its head removed is an embedding model"}),", and its 512-dim output is the vector representation of the image."]}),`
`,e.jsx(r,{items:[{q:"What does nn.Identity() on model.fc turn a classifier into, and why does that matter for the next module?",a:"It removes the classification layer so the network's output becomes the penultimate feature vector — 512 numbers for ResNet-18. That vector is the image embedding: a fixed-length representation you can compare with cosine similarity, index for retrieval, or feed to any downstream classifier. The classifier and the embedding model are the same network cut at different points."},{q:"Name the three baselines to run before believing a fine-tuning result.",a:"Majority class, which sets the floor and exposes class imbalance; a linear probe on frozen features, which shows how much the pretrained representation already solves; and the same architecture trained from random initialisation, which is the only way to prove pretraining helped rather than hurt. Fine-tuning has to beat all three to justify its cost."}]}),`
`,e.jsx(n.h2,{children:"Reading the result honestly"}),`
`,e.jsx(a,{prompt:"Your phase-1 (frozen backbone) validation accuracy comes back almost identical to phase-2 (fine-tuned). What does that most likely mean?",options:["The domain is close to ImageNet's — frozen features already suffice","Something is broken; fine-tuning should always win","Not enough information to say"],correct:0,children:e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Observation"}),e.jsx(n.th,{children:"Diagnosis"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Phase 1 already near phase 2"}),e.jsx(n.td,{children:"domain is close; frozen features suffice, save the compute"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Phase 2 much better than phase 1"}),e.jsx(n.td,{children:"domain needed adaptation — fine-tuning earned its cost"})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["Phase 2 ",e.jsx(n.em,{children:"worse"})," than phase 1"]}),e.jsx(n.td,{children:"LR too high, or too little data for the unfrozen block"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Both near the from-scratch baseline"}),e.jsx(n.td,{children:"negative transfer, or the task does not need ImageNet's priors"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Train accuracy ≫ val accuracy"}),e.jsx(n.td,{children:"overfitting — freeze more, augment harder, or get more data"})]})]})]})}),`
`,e.jsx(r,{items:[{q:"Phase 2 comes out worse than phase 1. What are the two likely causes?",a:"The backbone learning rate is too high, so the pretrained weights are being damaged rather than refined; or there is not enough data to constrain the newly unfrozen parameters, so the model overfits. Both are fixed in the same direction: lower the backbone LR, unfreeze less, or augment more heavily."}]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(o,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The whole job is five steps: ",e.jsx(n.strong,{children:"load, freeze, replace the head, warm up, unfreeze"}),"."]}),`
`,e.jsx(n.li,{children:"Always print the trainable/total parameter ratio. It is the fastest check that your freezing did what you think."}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Three baselines"})," before you tune anything: majority class, a linear probe on frozen features, and from-scratch. Transfer must beat all three to have earned its place."]}),`
`,e.jsx(n.li,{children:"Two-phase training with discriminative learning rates is the default recipe, not an advanced trick."}),`
`,e.jsx(n.li,{children:"The gap between phase-1 and phase-2 accuracy tells you whether your domain actually needed fine-tuning."}),`
`]})}),`
`,e.jsx(l,{question:"After replacing ResNet-18's fc with nn.Linear(512, 10) and freezing everything else, roughly what fraction of the model is trainable?",options:["About 0.05% (5,130 of 11.18M)","About 5%","About 45%","100% — replacing the head unfreezes the network"],correct:0})]})}function m(t={}){const{wrapper:n}={...i(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{m as default};
