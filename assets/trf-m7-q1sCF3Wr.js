import{u as o,j as e,C as a,B as d,R as r,Q as l,M as h}from"./index-Ba5-wm3B.js";import{P as s}from"./PredictReveal-CQqAapoB.js";function i(t){const n={a:"a",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 7: Demonstration — Self-Attention in PyTorch"}),`
`,e.jsxs(a,{title:"Run the code",children:[e.jsxs(n.p,{children:[`Every code block in this track is collected into one runnable notebook:
`,e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/transformers/transformers-lab.ipynb",children:"Open the Transformers lab in Google Colab"})}),"."]}),e.jsxs(n.p,{children:[`It runs top to bottom on a fresh runtime — self-attention and multi-head attention built from scratch, causal masking
verified against a hand-computed example, and a numeric check against `,e.jsx(n.code,{children:"torch.nn.functional.scaled_dot_product_attention"}),`.
Not executed in this module — read the code here, run it in Colab when you want the actual numbers.`]})]}),`
`,e.jsx(d,{children:e.jsx(n.p,{children:"Modules 4 and 5 built the formula piece by piece: score, mask, softmax, weighted sum of values. This module is that exact formula in PyTorch — small enough to read end to end, and close enough to a real implementation that scaling it up is mostly a matter of bigger numbers, not new ideas."})}),`
`,e.jsx(n.h2,{children:"One head of self-attention"}),`
`,e.jsxs(s,{prompt:"The class below needs three separate nn.Linear layers for Query, Key, and Value. Do they all need to be the same output size?",options:["Yes, always","Query and Key must match each other (for the dot product); Value can be a different size"],correct:1,children:[e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SelfAttentionHead(nn.Module):
    def __init__(self, embed_dim, head_dim):
        super().__init__()
        self.Wq = nn.Linear(embed_dim, head_dim, bias=False)
        self.Wk = nn.Linear(embed_dim, head_dim, bias=False)
        self.Wv = nn.Linear(embed_dim, head_dim, bias=False)
        self.head_dim = head_dim

    def forward(self, x, causal=True):
        # x: (batch, seq_len, embed_dim)
        Q, K, V = self.Wq(x), self.Wk(x), self.Wv(x)          # each (batch, seq_len, head_dim)
        scores = Q @ K.transpose(-2, -1) / math.sqrt(self.head_dim)   # (batch, seq_len, seq_len)

        if causal:
            seq_len = x.size(1)
            mask = torch.triu(torch.ones(seq_len, seq_len), diagonal=1).bool()
            scores = scores.masked_fill(mask, float('-inf'))

        alpha = F.softmax(scores, dim=-1)
        return alpha @ V                                        # (batch, seq_len, head_dim)
`})}),e.jsxs(n.p,{children:[e.jsx(n.code,{children:"Q"})," and ",e.jsx(n.code,{children:"K"})," must land in the same dimensional space because ",e.jsx(n.code,{children:"Q @ K.transpose(-2, -1)"})," is a dot product between them — ",e.jsx(n.code,{children:"head_dim"})," has to match. ",e.jsx(n.code,{children:"V"})," only ever gets weighted and summed, never compared against anything, so it's free to be a different size (this is exactly the down-projected ",e.jsx(n.code,{children:"V"})," from Module 6)."]})]}),`
`,e.jsx(r,{items:[{q:"In SelfAttentionHead, why does the causal mask use torch.triu with diagonal=1 rather than diagonal=0?",a:"torch.triu(..., diagonal=1) marks everything strictly above the main diagonal — the future positions relative to each row — while leaving the diagonal itself (a position attending to itself) unmasked. diagonal=0 would incorrectly mask a position from attending to itself too."}]}),`
`,e.jsx(n.h2,{children:"Stacking heads"}),`
`,e.jsxs(s,{prompt:"MultiHeadAttention below runs several SelfAttentionHead instances and concatenates their outputs. If each head outputs head_dim=64 and there are 8 heads, what shape is the concatenated result, per token?",options:["Still 64 — concatenation doesn't change size","64 * 8 = 512"],correct:1,children:[e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`class MultiHeadAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        assert embed_dim % num_heads == 0
        head_dim = embed_dim // num_heads
        self.heads = nn.ModuleList([SelfAttentionHead(embed_dim, head_dim) for _ in range(num_heads)])
        self.out_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x, causal=True):
        outputs = [head(x, causal) for head in self.heads]   # num_heads tensors, each (batch, seq_len, head_dim)
        concatenated = torch.cat(outputs, dim=-1)              # (batch, seq_len, embed_dim)
        return self.out_proj(concatenated)                     # one more linear layer to mix heads together

# Sanity check against PyTorch's own attention.
mha = MultiHeadAttention(embed_dim=512, num_heads=8)
x = torch.randn(2, 6, 512)                     # batch=2, seq_len=6
out = mha(x, causal=True)
print(out.shape)                                # torch.Size([2, 6, 512])
assert out.shape == x.shape
`})}),e.jsxs(n.p,{children:["Concatenating 8 heads of dimension 64 gives back exactly ",e.jsx(n.code,{children:"embed_dim=512"})," — by design, so a multi-head block's output can be added straight back onto the residual stream, the same shape it started with. The final ",e.jsx(n.code,{children:"out_proj"})," linear layer mixes information across heads before that addition happens."]})]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Query and Key projections must share a dimension because they're dot-producted directly; Value can be a different (usually smaller, down-projected) size."}),`
`,e.jsxs(n.li,{children:["The causal mask is built with ",e.jsx(n.code,{children:"torch.triu(..., diagonal=1)"})," so a position can attend to itself and everything earlier, but nothing later."]}),`
`,e.jsx(n.li,{children:"Multi-head attention runs several heads, concatenates their outputs back to the original embedding dimension, then mixes them with one more linear layer."}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"num_heads * head_dim = embed_dim"})," is not a coincidence — it's what lets the block's output be added directly back onto the input."]}),`
`]})}),`
`,e.jsx(l,{question:"In the MultiHeadAttention implementation, why must num_heads * head_dim equal embed_dim?",options:["It's an arbitrary convention with no functional reason","So the concatenated output of all heads matches the original embedding dimension and can be added back onto the residual stream","PyTorch's nn.Linear requires it","It reduces the number of parameters in the model"],correct:1}),`
`,e.jsx(h,{question:"Which statements about this PyTorch self-attention implementation are correct?",options:["Query and Key must have matching dimensions because they are dot-producted together","Value must have the same dimension as Query and Key","The causal mask sets future positions' scores to -infinity before softmax","A position is allowed to attend to itself under the causal mask used here","Concatenating all heads' outputs restores the original embedding dimension","MultiHeadAttention requires a separate softmax call outside of each individual head"],correct:[0,2,3,4]})]})}function u(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{u as default};
