import{u as o,j as e,C as r,B as d,R as s,Q as c,M as a}from"./index-Ba5-wm3B.js";import{P as h}from"./PredictReveal-CQqAapoB.js";function i(t){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 4: Demonstration — Encoder-Decoder in PyTorch"}),`
`,e.jsxs(r,{title:"Run the code",children:[e.jsxs(n.p,{children:[`This module's full encoder-decoder is collected into a runnable notebook, alongside the attention version from Module 9:
`,e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/attention-seq2seq/attention-seq2seq-lab.ipynb",children:"Open the Attention & Encoder-Decoder lab in Google Colab"})}),"."]}),e.jsx(n.p,{children:"Not executed in this module — read the code here, run it in Colab when you want the actual numbers."})]}),`
`,e.jsx(d,{children:e.jsx(n.p,{children:"Modules 2 and 3 covered the architecture and how to grade its output. This module is the architecture in code — an encoder, a decoder, and the training loop that connects them, small enough to read end to end."})}),`
`,e.jsx(n.h2,{children:"The encoder and decoder as modules"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`import torch
import torch.nn as nn

class Encoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.GRU(embed_dim, hidden_dim, batch_first=True)

    def forward(self, src):                    # src: (batch, src_len)
        embedded = self.embed(src)              # (batch, src_len, embed_dim)
        _, hidden = self.rnn(embedded)           # hidden: (1, batch, hidden_dim)
        return hidden                            # this IS the context vector c

class Decoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.GRU(embed_dim, hidden_dim, batch_first=True)
        self.out = nn.Linear(hidden_dim, vocab_size)

    def forward(self, input_tok, hidden):        # input_tok: (batch, 1)
        embedded = self.embed(input_tok)          # (batch, 1, embed_dim)
        output, hidden = self.rnn(embedded, hidden)
        logits = self.out(output.squeeze(1))       # (batch, vocab_size)
        return logits, hidden
`})}),`
`,e.jsxs(n.p,{children:["Nothing here is new machinery — it's the RNN track's ",e.jsx(n.code,{children:"nn.GRU"}),", wired so the encoder's final ",e.jsx(n.code,{children:"hidden"})," becomes the decoder's initial ",e.jsx(n.code,{children:"hidden"}),". That handoff line is the entire architecture from Module 2, in code."]}),`
`,e.jsx(n.h2,{children:"Training with teacher forcing"}),`
`,e.jsxs(h,{prompt:"Early in training, the decoder's predictions are mostly wrong. If you feed each step's own (wrong) prediction back in as the next input during training, what happens to the training signal?",options:["Nothing changes — the model still learns just as well","Errors compound: one wrong token derails every token after it, making gradients noisy and training slower"],correct:1,children:[e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`def train_step(encoder, decoder, src, tgt, optimizer, criterion, teacher_forcing=0.5):
    optimizer.zero_grad()
    hidden = encoder(src)
    input_tok = tgt[:, 0:1]                      # <sos>
    loss = 0
    for t in range(1, tgt.size(1)):
        logits, hidden = decoder(input_tok, hidden)
        loss += criterion(logits, tgt[:, t])
        use_teacher = torch.rand(1).item() < teacher_forcing
        input_tok = tgt[:, t:t+1] if use_teacher else logits.argmax(-1, keepdim=True)
    loss.backward()
    optimizer.step()
    return loss.item() / (tgt.size(1) - 1)
`})}),e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Teacher forcing"})," feeds the ",e.jsx(n.em,{children:"ground-truth"})," previous token as the decoder's next input during training, instead of its own (possibly wrong) prediction. This decouples one step's error from contaminating every later step, so gradients stay clean and training converges faster. The ",e.jsx(n.code,{children:"teacher_forcing"})," probability is annealed down over training so the model also gets practice recovering from its own mistakes — since at inference time there's no ground truth to fall back on."]})]}),`
`,e.jsx(s,{items:[{q:"What does the encoder's forward() return, and why does the decoder need it?",a:"It returns the final hidden state of its GRU after reading the whole source sequence — the context vector c. The decoder needs it as its own initial hidden state; it's the only information the decoder ever receives about the source sentence."},{q:"What is teacher forcing, and why anneal it down over training rather than using it 100% of the time?",a:"Teacher forcing feeds the ground-truth previous token to the decoder during training instead of its own prediction, which speeds up and stabilises early training. But at inference there's no ground truth available, so a model trained with 100% teacher forcing never practices recovering from its own errors — annealing the probability down exposes it to its own predictions increasingly often as training proceeds."}]}),`
`,e.jsx(n.h2,{children:"Inference: greedy decoding"}),`
`,e.jsxs(n.p,{children:["At inference time there's no target sequence to teacher-force from — the loop simply feeds each predicted token back in, starting from ",e.jsx(n.code,{children:"SOS"})," and stopping at ",e.jsx(n.code,{children:"EOS"})," or a max length:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`@torch.no_grad()
def translate(encoder, decoder, src, sos_id, eos_id, max_len=20):
    hidden = encoder(src)
    input_tok = torch.tensor([[sos_id]])
    tokens = []
    for _ in range(max_len):
        logits, hidden = decoder(input_tok, hidden)
        next_tok = logits.argmax(-1, keepdim=True)
        if next_tok.item() == eos_id:
            break
        tokens.append(next_tok.item())
        input_tok = next_tok
    return tokens
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(r,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The encoder-decoder architecture is two small ",e.jsx(n.code,{children:"nn.GRU"}),"-based modules: the encoder's final hidden state becomes the decoder's initial hidden state — the context vector, in code."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Teacher forcing"})," feeds the ground-truth previous token during training instead of the model's own prediction, preventing early errors from compounding through the rest of the sequence."]}),`
`,e.jsx(n.li,{children:"Teacher forcing probability is typically annealed down over training so the model also learns to recover from its own mistakes, since inference has no ground truth to fall back on."}),`
`,e.jsxs(n.li,{children:["At inference, decoding is autoregressive and greedy: feed each predicted token back in until ",e.jsx(n.code,{children:"EOS"})," or a max length is hit."]}),`
`]})}),`
`,e.jsx(c,{question:"Why is teacher forcing annealed down over the course of training rather than kept at 100%?",options:["It has no effect on training, so annealing is purely cosmetic","100% teacher forcing makes training unstable and slow","At inference there's no ground truth to feed in, so the model needs practice recovering from its own predictions","Annealing reduces the number of parameters the decoder needs"],correct:2}),`
`,e.jsx(a,{question:"Which statements about this PyTorch encoder-decoder are correct?",options:["The encoder's final GRU hidden state is passed directly as the decoder's initial hidden state","The decoder processes the entire target sequence in a single forward call, with no loop","Teacher forcing feeds the ground-truth previous token to the decoder during training","At inference, the decoder feeds its own predicted token back in as the next input","The encoder and decoder must share the same nn.Embedding layer","Decoding stops when the maximum length is reached or an end-of-sequence token is produced"],correct:[0,2,3,5]})]})}function g(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{g as default};
