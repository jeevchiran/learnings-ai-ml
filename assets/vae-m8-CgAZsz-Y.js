import{u as r,j as e,C as t,B as l,R as a,Q as o}from"./index-WYRBR6CI.js";import{P as c}from"./PredictReveal-DnF7AdIF.js";function i(n){const s={a:"a",annotation:"annotation",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",math:"math",mi:"mi",mn:"mn",mo:"mo",mrow:"mrow",msub:"msub",mtext:"mtext",p:"p",pre:"pre",semantics:"semantics",span:"span",strong:"strong",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{children:"Module 8: Demonstration — Variational Autoencoder in PyTorch"}),`
`,e.jsxs(t,{title:"Run the Code",children:[e.jsx(s.p,{children:"This module's complete VAE model, custom loss function, training loop, 2D latent grid manifold visualizer, and interpolation scripts are collected into an end-to-end runnable notebook:"}),e.jsxs(s.p,{children:[e.jsx(s.strong,{children:e.jsx(s.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/vae/vae-lab.ipynb",children:"Open the Variational Autoencoders lab in Google Colab"})}),"."]}),e.jsx(s.p,{children:"Read through the modular architecture below, then open the Colab notebook to run it directly on GPU/CPU!"})]}),`
`,e.jsx(l,{children:e.jsx(s.p,{children:"Modules 1 through 6 assembled the theory: probabilistic encodings, the ELBO objective, Gaussian KL divergence, the reparameterization trick, and proper loss scaling. Now, we put all pieces together into a clean, complete PyTorch implementation."})}),`
`,e.jsx(s.h2,{children:"The Complete VAE Module Architecture"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`import torch
import torch.nn as nn
import torch.nn.functional as F

class VAE(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=400, latent_dim=20):
        super().__init__()
        self.latent_dim = latent_dim

        # Encoder Network
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)     # Mean μ
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim) # Log-variance log(σ²)

        # Decoder Network
        self.fc3 = nn.Linear(latent_dim, hidden_dim)
        self.fc4 = nn.Linear(hidden_dim, input_dim)

    def encode(self, x):
        h = F.relu(self.fc1(x))
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        return mu, logvar

    def reparameterize(self, mu, logvar):
        if self.training:
            std = torch.exp(0.5 * logvar)
            eps = torch.randn_like(std)
            return mu + eps * std
        else:
            # During evaluation, deterministic mean is often used for reconstructions
            return mu

    def decode(self, z):
        h = F.relu(self.fc3(z))
        return torch.sigmoid(self.fc4(h)) # Output in [0, 1]

    def forward(self, x):
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        recon_x = self.decode(z)
        return recon_x, mu, logvar
`})}),`
`,e.jsx(s.h2,{children:"The VAE Loss Function"}),`
`,e.jsxs(c,{prompt:"The loss adds a reconstruction term and a divergence term. What happens if the divergence term is given far too much weight?",options:["Sharper reconstructions","The encoder collapses to the prior and ignores the input, so every sample decodes to the same blur"],correct:1,children:[e.jsxs(s.p,{children:["The loss function implements the negative ELBO: ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{mathvariant:"script",children:"L"}),e.jsx(s.mo,{children:"="}),e.jsx(s.mtext,{children:"BCE"}),e.jsx(s.mo,{children:"+"}),e.jsxs(s.msub,{children:[e.jsx(s.mi,{children:"D"}),e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"K"}),e.jsx(s.mi,{children:"L"})]})]})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\mathcal{L} = \\text{BCE} + D_{KL}"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.6833em"}}),e.jsx(s.span,{className:"mord mathcal",children:"L"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"="}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.7667em",verticalAlign:"-0.0833em"}}),e.jsx(s.span,{className:"mord text",children:e.jsx(s.span,{className:"mord",children:"BCE"})}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}}),e.jsx(s.span,{className:"mbin",children:"+"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2222em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.8333em",verticalAlign:"-0.15em"}}),e.jsxs(s.span,{className:"mord",children:[e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0278em"},children:"D"}),e.jsx(s.span,{className:"msupsub",children:e.jsxs(s.span,{className:"vlist-t vlist-t2",children:[e.jsxs(s.span,{className:"vlist-r",children:[e.jsx(s.span,{className:"vlist",style:{height:"0.3283em"},children:e.jsxs(s.span,{style:{top:"-2.55em",marginLeft:"-0.0278em",marginRight:"0.05em"},children:[e.jsx(s.span,{className:"pstrut",style:{height:"2.7em"}}),e.jsx(s.span,{className:"sizing reset-size6 size3 mtight",children:e.jsxs(s.span,{className:"mord mtight",children:[e.jsx(s.span,{className:"mord mathnormal mtight",style:{marginRight:"0.0715em"},children:"K"}),e.jsx(s.span,{className:"mord mathnormal mtight",children:"L"})]})})]})}),e.jsx(s.span,{className:"vlist-s",children:"​"})]}),e.jsx(s.span,{className:"vlist-r",children:e.jsx(s.span,{className:"vlist",style:{height:"0.15em"},children:e.jsx(s.span,{})})})]})})]})]})]})]}),"."]}),e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def vae_loss_function(recon_x, x, mu, logvar):
    # Reconstruction loss (summed over all input pixels)
    BCE = F.binary_cross_entropy(recon_x, x, reduction='sum')
    
    # Analytical Gaussian KL Divergence: -0.5 * sum(1 + log(σ²) - μ² - σ²)
    KLD = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
    
    # Total loss normalized by batch size
    batch_size = x.size(0)
    return (BCE + KLD) / batch_size, BCE / batch_size, KLD / batch_size
`})})]}),`
`,e.jsx(a,{items:[{q:"What is posterior collapse and what causes it?",a:"The encoder learns to output the prior regardless of its input, so the latent code carries no information and every reconstruction is an average of the dataset. It happens when the divergence term dominates the reconstruction term, which is why the balance between them is the parameter that matters most."}]}),`
`,e.jsx(s.h2,{children:"The End-to-End Training Loop"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`def train_epoch(model, dataloader, optimizer, device):
    model.train()
    total_loss, total_bce, total_kld = 0, 0, 0

    for batch_idx, (data, _) in enumerate(dataloader):
        data = data.view(data.size(0), -1).to(device) # Flatten (B, 784)
        
        optimizer.zero_grad()
        recon_batch, mu, logvar = model(data)
        
        loss, bce, kld = vae_loss_function(recon_batch, data, mu, logvar)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * len(data)
        total_bce += bce.item() * len(data)
        total_kld += kld.item() * len(data)

    n = len(dataloader.dataset)
    return total_loss / n, total_bce / n, total_kld / n
`})}),`
`,e.jsx(s.h2,{children:"Generating Novel Samples from the Prior"}),`
`,e.jsx(s.p,{children:"To sample completely new images from scratch, we skip the encoder entirely:"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-python",children:`@torch.no_grad()
def generate_samples(model, num_samples=16, device='cpu'):
    model.eval()
    # 1. Sample z directly from the standard normal prior p(z) = N(0, I)
    z = torch.randn(num_samples, model.latent_dim).to(device)
    
    # 2. Decode into generated images
    samples = model.decode(z)
    return samples.view(num_samples, 28, 28)
`})}),`
`,e.jsx(a,{items:[{q:"Why do we call model.eval() and skip the encoder during sample generation?",a:"Because generative synthesis samples directly from the prior distribution p(z) = 𝒩(0, I). The encoder is only used during training and when inferring latent codes for specific existing images."},{q:"Why does the decoder end with a Sigmoid activation?",a:"Because input pixel values are normalized to [0, 1]. Sigmoid bounds the output intensities to (0, 1), which matches the Bernoulli likelihood interpretation required by Binary Cross-Entropy."}]}),`
`,e.jsx(s.hr,{}),`
`,e.jsx(t,{title:"TL;DR",children:e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["A complete VAE is four small pieces: an ",e.jsx(s.strong,{children:"encoder"})," emitting ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsx(s.mrow,{children:e.jsx(s.mi,{children:"μ"})}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"\\mu"})]})})}),e.jsx(s.span,{className:"katex-html","aria-hidden":"true",children:e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.625em",verticalAlign:"-0.1944em"}}),e.jsx(s.span,{className:"mord mathnormal",children:"μ"})]})})]})," and ",e.jsx(s.code,{children:"logvar"}),", the ",e.jsx(s.strong,{children:"reparameterise"})," step, a ",e.jsx(s.strong,{children:"decoder"}),", and a loss that adds reconstruction to KL."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"reparameterize"})," uses ",e.jsx(s.code,{children:"torch.randn_like(std)"})," so the noise automatically matches the shape, dtype and device of ",e.jsx(s.code,{children:"std"})," — the standard way to avoid a device mismatch."]}),`
`,e.jsxs(s.li,{children:["Both loss terms are ",e.jsx(s.strong,{children:"summed over dimensions and divided by batch size"}),", keeping the balance Module 7 warned about."]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"Generation skips the encoder entirely"}),": draw ",e.jsxs(s.span,{className:"katex",children:[e.jsx(s.span,{className:"katex-mathml",children:e.jsx(s.math,{xmlns:"http://www.w3.org/1998/Math/MathML",children:e.jsxs(s.semantics,{children:[e.jsxs(s.mrow,{children:[e.jsx(s.mi,{children:"z"}),e.jsx(s.mo,{children:"∼"}),e.jsx(s.mi,{mathvariant:"script",children:"N"}),e.jsx(s.mo,{stretchy:"false",children:"("}),e.jsx(s.mn,{children:"0"}),e.jsx(s.mo,{separator:"true",children:","}),e.jsx(s.mi,{children:"I"}),e.jsx(s.mo,{stretchy:"false",children:")"})]}),e.jsx(s.annotation,{encoding:"application/x-tex",children:"z \\sim \\mathcal{N}(0, I)"})]})})}),e.jsxs(s.span,{className:"katex-html","aria-hidden":"true",children:[e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"0.4306em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.044em"},children:"z"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}}),e.jsx(s.span,{className:"mrel",children:"∼"}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.2778em"}})]}),e.jsxs(s.span,{className:"base",children:[e.jsx(s.span,{className:"strut",style:{height:"1em",verticalAlign:"-0.25em"}}),e.jsx(s.span,{className:"mord mathcal",style:{marginRight:"0.1474em"},children:"N"}),e.jsx(s.span,{className:"mopen",children:"("}),e.jsx(s.span,{className:"mord",children:"0"}),e.jsx(s.span,{className:"mpunct",children:","}),e.jsx(s.span,{className:"mspace",style:{marginRight:"0.1667em"}}),e.jsx(s.span,{className:"mord mathnormal",style:{marginRight:"0.0785em"},children:"I"}),e.jsx(s.span,{className:"mclose",children:")"})]})]})]})," and decode. The encoder exists only for training and for inferring codes of real inputs."]}),`
`]})}),`
`,e.jsx(s.h2,{children:"Summary Check"}),`
`,e.jsx(o,{question:"In the reparameterize() function, why do we use `torch.randn_like(std)`?",options:["To ensure the random noise tensor ε matches both the shape and the CUDA/CPU device of the standard deviation tensor std automatically.","To prevent gradient updates from reaching the decoder.","Because standard normal sampling requires integer dimensions."],correct:0}),`
`,e.jsx(a,{items:[{q:"Check your reasoning",a:"`randn_like` guarantees that the generated noise has identical shape, data type, and execution device (GPU vs CPU) as `std`, avoiding device mismatches in PyTorch."}]})]})}function h(n={}){const{wrapper:s}={...r(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}export{h as default};
