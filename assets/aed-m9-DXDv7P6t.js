import{u as d,j as e,C as o,B as i,R as a,Q as h,M as c}from"./index-Ba5-wm3B.js";import{P as s}from"./PredictReveal-CQqAapoB.js";function r(n){const t={a:"a",code:"code",h1:"h1",h2:"h2",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...d(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{children:"Module 9: Demonstration — Attention Encoder-Decoder in PyTorch"}),`
`,e.jsxs(o,{title:"Run the code",children:[e.jsxs(t.p,{children:[`Same notebook as Module 4 — the attention-based decoder is the second half:
`,e.jsx(t.strong,{children:e.jsx(t.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/attention-seq2seq/attention-seq2seq-lab.ipynb",children:"Open the Attention & Encoder-Decoder lab in Google Colab"})}),"."]}),e.jsx(t.p,{children:"Not executed in this module — read the code here, run it in Colab when you want the actual numbers."})]}),`
`,e.jsx(i,{children:e.jsx(t.p,{children:"Module 4 had a decoder that took one hidden state and never looked back. Module 8 gave you the attention module itself. This module wires them together into a complete, trainable attention decoder — the smallest possible diff from Module 4's code that gets you everything Modules 6–8 described."})}),`
`,e.jsx(t.h2,{children:"The attention decoder"}),`
`,e.jsxs(s,{prompt:"Compared to the plain Decoder from Module 4, does the attention decoder need access to ALL of the encoder's outputs, or just its final hidden state?",options:["Just the final hidden state, same as before","All of the encoder's per-step outputs — attention needs every h_j to score against"],correct:1,children:[e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`class AttnDecoder(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.attn = BahdanauAttention(hidden_dim)
        self.rnn = nn.GRU(embed_dim + hidden_dim, hidden_dim, batch_first=True)
        self.out = nn.Linear(hidden_dim, vocab_size)

    def forward(self, input_tok, hidden, enc_outputs):
        embedded = self.embed(input_tok)                     # (batch, 1, embed_dim)
        context, weights = self.attn(hidden.squeeze(0), enc_outputs)
        rnn_input = torch.cat([embedded, context.unsqueeze(1)], dim=-1)
        output, hidden = self.rnn(rnn_input, hidden)
        logits = self.out(output.squeeze(1))
        return logits, hidden, weights
`})}),e.jsxs(t.p,{children:["The change from Module 4's ",e.jsx(t.code,{children:"Decoder"}),", line by line: the encoder now has to be run with ",e.jsx(t.code,{children:"return_sequences"}),"-style output — every per-step hidden state, not just the last one — so there's something for ",e.jsx(t.code,{children:"attn"})," to score against. Each decoder step concatenates the token embedding with a freshly-computed ",e.jsx(t.code,{children:"context"})," before feeding the GRU, instead of relying solely on the carried-over hidden state. And ",e.jsx(t.code,{children:"forward"})," now also returns ",e.jsx(t.code,{children:"weights"}),", purely so you can inspect what the model attended to — it plays no role in the loss."]})]}),`
`,e.jsx(a,{items:[{q:"What does the encoder need to return differently to support the attention decoder, compared to Module 4's plain encoder?",a:"Every per-step hidden state (the full sequence of encoder outputs), not just the final one. The attention module needs all of them to score against at every decoder step, whereas the plain decoder only ever used the single final hidden state."}]}),`
`,e.jsx(t.h2,{children:"The training loop barely changes"}),`
`,e.jsxs(s,{prompt:"Given that AttnDecoder.forward() has almost the same signature as Module 4's Decoder.forward() (input token + hidden in, logits + hidden out), how much of Module 4's train_step() loop needs to change?",options:["Nearly all of it — attention requires a fundamentally different training procedure","Almost none of it — mostly just passing enc_outputs through and ignoring the extra weights return value"],correct:1,children:[e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`def train_step(encoder, decoder, src, tgt, optimizer, criterion, teacher_forcing=0.5):
    optimizer.zero_grad()
    enc_outputs, hidden = encoder(src)          # now returns per-step outputs too
    input_tok = tgt[:, 0:1]
    loss = 0
    for t in range(1, tgt.size(1)):
        logits, hidden, _ = decoder(input_tok, hidden, enc_outputs)   # ignore weights here
        loss += criterion(logits, tgt[:, t])
        use_teacher = torch.rand(1).item() < teacher_forcing
        input_tok = tgt[:, t:t+1] if use_teacher else logits.argmax(-1, keepdim=True)
    loss.backward()
    optimizer.step()
    return loss.item() / (tgt.size(1) - 1)
`})}),e.jsxs(t.p,{children:["Teacher forcing, the loss function, the optimizer step — everything from Module 4 is untouched. The only differences are ",e.jsx(t.code,{children:"enc_outputs"})," threading through and the extra ",e.jsx(t.code,{children:"weights"})," return value, which training simply ignores (it's there for you to plot afterward, exactly the kind of heatmap Module 6 showed)."]})]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(o,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["The attention decoder needs the encoder's ",e.jsx(t.strong,{children:"full sequence of per-step hidden states"}),", not just the final one — that's what the score function scores against."]}),`
`,e.jsx(t.li,{children:"Each decoder step concatenates the token embedding with a freshly-computed context vector before the GRU update, instead of relying purely on the carried hidden state."}),`
`,e.jsxs(t.li,{children:["The training loop is almost unchanged from Module 4 — pass ",e.jsx(t.code,{children:"enc_outputs"})," through, ignore the extra ",e.jsx(t.code,{children:"weights"})," return value during training."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"weights"})," costs nothing in the loss but is exactly what you'd plot to reproduce Module 6's alignment heatmap on real trained data."]}),`
`]})}),`
`,e.jsx(h,{question:"What is the main structural change the encoder needs to make to support an attention decoder?",options:["It needs a second GRU layer","It needs to return every per-step hidden state, not just the final one","It needs to be replaced with a feedforward network","It needs a larger vocabulary size"],correct:1}),`
`,e.jsx(c,{question:"Which statements about the attention decoder implementation are correct?",options:["The decoder's RNN input is the token embedding concatenated with the computed context vector","The training loop requires a fundamentally different loss function than the plain encoder-decoder","The attention module's weights output plays no role in computing the loss","Teacher forcing works the same way as in the plain encoder-decoder's training loop","The encoder must be modified to expose its full sequence of hidden states","AttnDecoder.forward() no longer needs the previous hidden state as an input"],correct:[0,2,3,4]})]})}function p(n={}){const{wrapper:t}={...d(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(r,{...n})}):r(n)}export{p as default};
