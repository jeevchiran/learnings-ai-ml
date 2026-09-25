import{u as a,j as e,C as i,B as r,R as s,Q as d}from"./index-WYRBR6CI.js";import{P as l}from"./PredictReveal-DnF7AdIF.js";function o(t){const n={a:"a",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...a(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 10: Demonstration — DDPM in PyTorch"}),`
`,e.jsxs(i,{title:"Run the code",children:[e.jsx(n.p,{children:"This module's forward process, U-Net denoiser, simple loss, training loop, and sampling loop are collected into an end-to-end runnable notebook:"}),e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/diffusion/diffusion-lab.ipynb",children:"Open the Diffusion lab in Google Colab"})}),"."]}),e.jsx(n.p,{children:"It trains a small DDPM on Fashion-MNIST end to end, and reruns the module-2 closed-form forward check and the module-7 noise-schedule comparison against the trained model."})]}),`
`,e.jsx(r,{children:e.jsx(n.p,{children:"Modules 1 through 9 built the theory: the forward and reverse processes, the simple noise-prediction loss, the U-Net denoiser with timestep conditioning, sampling, schedules, guidance, and latent diffusion. This module assembles the core pieces into a single, runnable PyTorch DDPM."})}),`
`,e.jsx(n.h2,{children:"Forward Process and a Small Time-Conditioned U-Net"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch
import torch.nn as nn
import torch.nn.functional as F

T = 300

def linear_schedule(T, beta_start=1e-4, beta_end=0.02):
    betas = torch.linspace(beta_start, beta_end, T)
    alphas = 1.0 - betas
    alpha_bars = torch.cumprod(alphas, dim=0)
    return betas, alpha_bars

betas, alpha_bars = linear_schedule(T)

def forward_diffusion(x0, t, noise):
    # Closed form from Module 2: x_t = sqrt(alpha_bar_t) * x0 + sqrt(1 - alpha_bar_t) * noise
    sqrt_ab = alpha_bars[t].sqrt().view(-1, 1, 1, 1)
    sqrt_one_minus_ab = (1 - alpha_bars[t]).sqrt().view(-1, 1, 1, 1)
    return sqrt_ab * x0 + sqrt_one_minus_ab * noise


class TimeEmbedding(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim
        self.mlp = nn.Sequential(nn.Linear(dim, dim), nn.SiLU(), nn.Linear(dim, dim))

    def forward(self, t):
        half = self.dim // 2
        freqs = torch.exp(-torch.arange(half, device=t.device) * (9.2 / half))  # sinusoidal, Module 5
        args = t[:, None].float() * freqs[None, :]
        emb = torch.cat([torch.sin(args), torch.cos(args)], dim=-1)
        return self.mlp(emb)


class SimpleUNet(nn.Module):
    def __init__(self, time_dim=64):
        super().__init__()
        self.time_embed = TimeEmbedding(time_dim)
        self.down1 = nn.Conv2d(1, 64, 3, stride=2, padding=1)     # 28x28 -> 14x14
        self.down2 = nn.Conv2d(64, 128, 3, stride=2, padding=1)   # 14x14 -> 7x7
        self.time_proj1 = nn.Linear(time_dim, 64)
        self.time_proj2 = nn.Linear(time_dim, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1)   # 7x7 -> 14x14
        self.up2 = nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1)   # 14x14 -> 28x28 (skip-concat -> 128 in)
        self.out = nn.Conv2d(64 + 1, 1, 3, padding=1)  # skip-concat with the original input

    def forward(self, x, t):
        temb = self.time_embed(t)

        h1 = F.silu(self.down1(x) + self.time_proj1(temb)[:, :, None, None])   # (B, 64, 14, 14)
        h2 = F.silu(self.down2(h1) + self.time_proj2(temb)[:, :, None, None])  # (B, 128, 7, 7)

        u1 = F.silu(self.up1(h2))                       # (B, 64, 14, 14)
        u2 = F.silu(self.up2(torch.cat([u1, h1], dim=1)))  # skip connection -> (B, 64, 28, 28)

        return self.out(torch.cat([u2, x], dim=1))  # predict noise, same shape as x
`})}),`
`,e.jsx(s,{items:[{q:"Why does forward_diffusion index alpha_bars[t] rather than looping through t steps?",a:"This is the Module 2 closed-form shortcut: x_t can be computed directly from x0 and a single noise draw using the precomputed cumulative product alpha_bars[t], with no need to simulate the intermediate chain step by step."},{q:"Why does SimpleUNet concatenate h1 (from the downsampling path) into the upsampling path before the final layers?",a:"This is a U-Net skip connection (Module 5): it carries fine spatial detail lost during downsampling directly across to the upsampling path, which the network needs since its output must match the input's full resolution."}]}),`
`,e.jsx(n.h2,{children:"The Simple Loss and Training Loop"}),`
`,e.jsx(l,{prompt:"Training picks a random timestep for each image rather than walking through them in order. Why is that allowed?",options:["It is an approximation to save time","The closed-form forward process can jump straight to any timestep, so each one can be sampled independently"],correct:1,children:e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch.optim as optim

model = SimpleUNet().to(device)
optimizer = optim.Adam(model.parameters(), lr=2e-4)

def train_step(x0):
    batch_size = x0.size(0)
    t = torch.randint(0, T, (batch_size,), device=device)
    noise = torch.randn_like(x0)

    x_t = forward_diffusion(x0, t, noise)
    predicted_noise = model(x_t, t)

    loss = F.mse_loss(predicted_noise, noise)  # L_simple from Module 4
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    return loss.item()
`})})}),`
`,e.jsx(s,{items:[{q:"Why can training sample timesteps at random while sampling must run them in order?",a:"The forward noising process has a closed form that produces the state at any timestep directly from the clean image, so any timestep can be trained in isolation. Generation has no such shortcut: each reverse step needs the output of the previous one, so it is inherently sequential."}]}),`
`,e.jsx(n.h2,{children:"The Sampling Loop"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`@torch.no_grad()
def sample(model, num_samples=16, device='cpu'):
    model.eval()
    x = torch.randn(num_samples, 1, 28, 28, device=device)  # x_T ~ N(0, I)

    for t_val in reversed(range(T)):
        t = torch.full((num_samples,), t_val, device=device, dtype=torch.long)
        predicted_noise = model(x, t)

        alpha_t = 1 - betas[t_val]
        alpha_bar_t = alpha_bars[t_val]
        beta_t = betas[t_val]

        mean = (1 / alpha_t.sqrt()) * (x - (beta_t / (1 - alpha_bar_t).sqrt()) * predicted_noise)

        if t_val > 0:
            noise = torch.randn_like(x)
            x = mean + beta_t.sqrt() * noise  # stochastic reverse step
        else:
            x = mean  # final step: no noise added

    model.train()
    return x
`})}),`
`,e.jsx(s,{items:[{q:"Why does the sampling loop add noise at every step except the final one (t_val == 0)?",a:"Each intermediate reverse step p_theta(x_{t-1}|x_t) is a Gaussian with nonzero variance (Module 3), so sampling from it requires adding noise scaled by that step's variance. At t=0 the process is finished — x_0 is the final output, so no further noise should be injected."}]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(i,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The whole model is a ",e.jsx(n.strong,{children:"noise predictor"}),": a small time-conditioned U-Net that, given a noisy image and its timestep, guesses the noise that was added."]}),`
`,e.jsx(n.li,{children:"Training is one line of mean squared error, because the closed-form forward process lets any timestep be sampled directly and trained independently."}),`
`,e.jsx(n.li,{children:"Sampling has no such shortcut — each reverse step consumes the previous one's output, so generation is sequential and therefore slow."}),`
`,e.jsx(n.li,{children:"Noise is added at every reverse step except the last, because each intermediate step samples from a distribution with non-zero variance while the final output is the image itself."}),`
`]})}),`
`,e.jsx(n.h2,{children:"Summary Check"}),`
`,e.jsx(d,{question:"In the sampling loop, why must the for loop run in strict reverse order (t_val from T-1 down to 0), one iteration at a time?",options:["It's an arbitrary implementation choice with no effect on correctness","Each step's computation of x depends on the model's prediction using the current x, which was itself produced by the previous step — the same sequential dependency covered in Module 6","PyTorch requires loops to run in reverse for performance reasons","Running the loop forward would train the model incorrectly"],correct:1})]})}function p(t={}){const{wrapper:n}={...a(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(o,{...t})}):o(t)}export{p as default};
