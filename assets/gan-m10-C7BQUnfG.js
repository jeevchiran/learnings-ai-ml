import{u as r,j as e,C as t,B as o,R as i,Q as l}from"./index-WYRBR6CI.js";import{P as d}from"./PredictReveal-DnF7AdIF.js";function s(a){const n={a:"a",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 10: Demonstration — DCGAN in PyTorch"}),`
`,e.jsxs(t,{title:"Run the code",children:[e.jsx(n.p,{children:"This module's Generator, Discriminator, training loop, and sample-generation code are collected into an end-to-end runnable notebook:"}),e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/gan/gan-lab.ipynb",children:"Open the GAN lab in Google Colab"})}),"."]}),e.jsx(n.p,{children:"It trains a DCGAN on Fashion-MNIST end to end, and reruns the module-6 gradient-penalty check and the module-9 IS/FID proxy metrics against the trained model."})]}),`
`,e.jsx(o,{children:e.jsx(n.p,{children:"Modules 1 through 9 built the theory: the minimax game, its training pathologies and fixes, the DCGAN architecture, conditional and unpaired translation variants, and how to evaluate the result. This module assembles the core pieces into a single, runnable PyTorch DCGAN."})}),`
`,e.jsx(n.h2,{children:"Generator and Discriminator"}),`
`,e.jsx(n.p,{children:"Both follow the DCGAN guidelines from Module 5 — strided/transposed convolutions instead of pooling, BatchNorm everywhere except the two pixel-facing layers, ReLU in G, LeakyReLU in D."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch
import torch.nn as nn

LATENT_DIM = 100

class Generator(nn.Module):
    def __init__(self, latent_dim=LATENT_DIM):
        super().__init__()
        self.net = nn.Sequential(
            # z: (B, latent_dim, 1, 1) -> (B, 256, 7, 7)
            nn.ConvTranspose2d(latent_dim, 256, kernel_size=7, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(True),
            # (B, 256, 7, 7) -> (B, 128, 14, 14)
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            # (B, 128, 14, 14) -> (B, 1, 28, 28)
            nn.ConvTranspose2d(128, 1, kernel_size=4, stride=2, padding=1, bias=False),
            nn.Tanh(),  # output in [-1, 1], no BatchNorm on this layer
        )

    def forward(self, z):
        return self.net(z.view(z.size(0), -1, 1, 1))


class Discriminator(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            # x: (B, 1, 28, 28) -> (B, 128, 14, 14) -- no BatchNorm on this input-facing layer
            nn.Conv2d(1, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            # (B, 128, 14, 14) -> (B, 256, 7, 7)
            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            # (B, 256, 7, 7) -> (B, 1, 1, 1) logit
            nn.Conv2d(256, 1, kernel_size=7, stride=1, padding=0, bias=False),
        )

    def forward(self, x):
        return self.net(x).view(-1)  # raw logit, BCEWithLogitsLoss applies the sigmoid
`})}),`
`,e.jsx(n.h2,{children:"The Non-Saturating Training Loop"}),`
`,e.jsxs(d,{prompt:"Early in training the discriminator is nearly perfect, so its confidence that generated samples are fake is close to certainty. What does that do to the generator's original loss?",options:["Produces a strong corrective signal","Its gradient nearly vanishes, which is exactly why the non-saturating form is used instead"],correct:1,children:[e.jsx(n.p,{children:"D is trained on real and fake batches separately; G is trained against the non-saturating loss from Module 3."}),e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch.optim as optim

criterion = nn.BCEWithLogitsLoss()
G = Generator().to(device)
D = Discriminator().to(device)
opt_G = optim.Adam(G.parameters(), lr=2e-4, betas=(0.5, 0.999))
opt_D = optim.Adam(D.parameters(), lr=2e-4, betas=(0.5, 0.999))

def train_step(real_images):
    batch_size = real_images.size(0)
    real_labels = torch.ones(batch_size, device=device)
    fake_labels = torch.zeros(batch_size, device=device)

    # --- Train D: maximize log D(x) + log(1 - D(G(z))) ---
    opt_D.zero_grad()
    d_real = D(real_images)
    loss_d_real = criterion(d_real, real_labels)

    z = torch.randn(batch_size, LATENT_DIM, device=device)
    fake_images = G(z)
    d_fake = D(fake_images.detach())  # detach: this step only updates D
    loss_d_fake = criterion(d_fake, fake_labels)

    loss_d = loss_d_real + loss_d_fake
    loss_d.backward()
    opt_D.step()

    # --- Train G: maximize log D(G(z)) (non-saturating, Module 3) ---
    opt_G.zero_grad()
    d_on_fake = D(fake_images)  # no detach: gradient must flow into G this time
    loss_g = criterion(d_on_fake, real_labels)  # trick: label fakes as "real" to get the non-saturating gradient
    loss_g.backward()
    opt_G.step()

    return loss_d.item(), loss_g.item()
`})}),e.jsx(i,{items:[{q:"Why is fake_images.detach() used when training D, but not when training G?",a:"When training D, gradients should only flow into D's own parameters — detaching cuts the graph at G's output so backward() doesn't waste time computing gradients into G. When training G, the whole point is to backpropagate through D into G's parameters, so the graph must stay attached."},{q:"Why does the generator's training step label fake images as real_labels (1) rather than fake_labels (0)?",a:"This is exactly the non-saturating trick from Module 3: computing BCE against a target of 1 for D's output on fake images is mathematically the same as maximizing log(D(G(z))), which supplies a steep, useful gradient early in training instead of the flat gradient the original minimax form would give."}]})]}),`
`,e.jsx(i,{items:[{q:"Why is the non-saturating generator loss used instead of the original minimax form?",a:"In the minimax form the generator's gradient shrinks towards zero precisely when the discriminator is confident, which is the situation early in training. Maximising the log probability of being classified real instead gives a large gradient exactly when the generator is doing badly, so training can get started at all."}]}),`
`,e.jsx(n.h2,{children:"Generating New Samples"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`@torch.no_grad()
def generate_samples(G, num_samples=16, device='cpu'):
    G.eval()
    z = torch.randn(num_samples, LATENT_DIM, device=device)
    samples = G(z)
    G.train()
    return samples  # in [-1, 1]; rescale to [0, 1] with (samples + 1) / 2 before plotting
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(t,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The generator and the discriminator are ordinary convolutional networks; everything distinctive lives in the ",e.jsx(n.strong,{children:"loss and the alternation"}),", not in the architecture."]}),`
`,e.jsxs(n.li,{children:["The loop trains the discriminator on a real batch and a fake batch, then trains the generator through the discriminator's verdict with the ",e.jsx(n.strong,{children:"non-saturating"})," loss."]}),`
`,e.jsx(n.li,{children:"That loss exists because the original minimax form has a vanishing gradient exactly when the discriminator is winning, which is the whole of early training."}),`
`,e.jsx(n.li,{children:"Sampling afterwards needs only the generator: draw a latent vector, run one forward pass, and the discriminator can be discarded entirely."}),`
`]})}),`
`,e.jsx(n.h2,{children:"Summary Check"}),`
`,e.jsx(l,{question:"In the training loop above, why is D trained on a real batch and a fake batch as two separate forward/backward passes rather than one combined batch?",options:["It is purely a stylistic choice with no effect on training","Separate passes make it straightforward to track and log the real-loss and fake-loss components independently, and BatchNorm statistics stay cleaner when real and fake batches aren't mixed within one forward pass","PyTorch does not support concatenating real and fake tensors","It doubles the effective batch size seen by the optimizer"],correct:1})]})}function g(a={}){const{wrapper:n}={...r(),...a.components};return n?e.jsx(n,{...a,children:e.jsx(s,{...a})}):s(a)}export{g as default};
