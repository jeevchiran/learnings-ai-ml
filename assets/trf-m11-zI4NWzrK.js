import{u as o,j as e,C as a,B as d,R as i,Q as l,M as h}from"./index-Ba5-wm3B.js";import{P as s}from"./PredictReveal-CQqAapoB.js";function r(t){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 11: Fine-Tuning BERT for Classification"}),`
`,e.jsxs(a,{title:"Run the code",children:[e.jsxs(n.p,{children:[`Every code block in this track is collected into one runnable notebook:
`,e.jsx(n.strong,{children:e.jsx(n.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/transformers/transformers-lab.ipynb",children:"Open the Transformers lab in Google Colab"})}),"."]}),e.jsx(n.p,{children:`It loads a pretrained BERT tokenizer and encoder, adds a classification head, fine-tunes it on a small labelled
sentiment set, and runs inference on fresh sentences.
Not executed in this module — read the code here, run it in Colab when you want the actual numbers.`})]}),`
`,e.jsx(d,{children:e.jsxs(n.p,{children:["Module 10 sorted the family tree: encoder-only (BERT), decoder-only (GPT), encoder-decoder (T5). This module takes the encoder-only branch and answers the practical question — what do you actually ",e.jsx(n.em,{children:"do"})," with one? Almost nobody trains a BERT from scratch; the pre-training run that produced it cost more compute than your whole project. You download those weights and fine-tune them. If that sounds familiar, it is: the same freeze-versus-fine-tune decision from the Transfer Learning track, applied to language instead of vision. A pretrained encoder is a general-purpose feature extractor for text, exactly as a pretrained ResNet is one for images."]})}),`
`,e.jsx(n.h2,{children:"Loading the pretrained pieces"}),`
`,e.jsx(n.p,{children:"A checkpoint name buys you two separate things, and they must match each other."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_NAME = "bert-base-uncased"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)
`})}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.strong,{children:"tokenizer"})," carries the subword vocabulary and the splitting rules that were fixed during pre-training. The ",e.jsx(n.strong,{children:"model"}),`
carries the network parameters learned during that same run. Mixing a tokenizer from one checkpoint with weights from
another maps words onto integer IDs the encoder never saw — the embeddings become nonsense, silently.`]}),`
`,e.jsxs(n.p,{children:["Notice what ",e.jsx(n.code,{children:"AutoModelForSequenceClassification"}),` prints a warning about: the encoder weights load from disk, but the
classification layer on top is `,e.jsx(n.strong,{children:"newly initialised at random"}),". That is the piece fine-tuning has to teach from scratch."]}),`
`,e.jsx(n.h2,{children:"Preparing text into the format BERT expects"}),`
`,e.jsx(n.p,{children:"Raw strings are not input. Four transformations stand between a sentence and a tensor."}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Subword splitting"})," — the sentence is cut into vocabulary units. Unknown words are decomposed rather than discarded."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"ID mapping"})," — each subword becomes an integer index into the embedding table."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Special boundary tokens"})," — ",e.jsx(n.code,{children:"[CLS]"})," is inserted at the start of every sequence, ",e.jsx(n.code,{children:"[SEP]"}),` at the end and between the
two halves of a sentence pair.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Attention masks"})," — short sequences are padded up to a common length with ",e.jsx(n.code,{children:"[PAD]"}),`, and a mask marks which positions
are real.`]}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`texts = ["the plot dragged but the acting saved it", "an absolute waste of two hours"]

enc = tokenizer(
    texts,
    padding="max_length",
    truncation=True,
    max_length=64,
    return_tensors="pt",
)

print(tokenizer.convert_ids_to_tokens(enc["input_ids"][1])[:12])
# ['[CLS]', 'an', 'absolute', 'waste', 'of', 'two', 'hours', '[SEP]', '[PAD]', '[PAD]', '[PAD]', '[PAD]']
print(enc["attention_mask"][1][:12])
# tensor([1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])
`})}),`
`,e.jsxs(s,{prompt:"Padding makes every sequence the same length so they fit in one tensor. Without an attention mask, what goes wrong when self-attention runs over those padded positions?",options:["Nothing — padding tokens embed to zero, so they contribute nothing","Real tokens would attend to the padding, and the softmax would spend probability mass on meaningless positions"],correct:1,children:[e.jsxs(n.p,{children:[e.jsx(n.code,{children:"[PAD]"}),` is a real vocabulary entry with a real learned embedding — it is not zero. Left alone, it produces real Query and
Key vectors, real dot-product scores, and therefore real attention weight. Because softmax normalises across the whole
row, every unit of probability handed to padding is a unit stolen from actual words, and the amount stolen depends on how
much padding a given example happened to need. Two identical sentences sitting in differently sized batches would end up
with different representations.`]}),e.jsx(n.p,{children:`The fix is the mechanism from Module 4, reused verbatim. Before the softmax, scores at masked positions are set to
negative infinity:`}),e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`scores = scores.masked_fill(attention_mask[:, None, None, :] == 0, float("-inf"))
alpha  = scores.softmax(dim=-1)   # exp(-inf) = 0 -> padded positions get exactly zero weight
`})}),e.jsxs(n.p,{children:[`Identical machinery to the causal mask, different motivation. The causal mask hides the future because looking ahead
would be cheating; the padding mask hides `,e.jsx(n.code,{children:"[PAD]"}),` because it carries no information. Both work by driving a score to
negative infinity so `,e.jsx(n.code,{children:"exp"}),` sends it to zero. BERT is bidirectional and has no causal mask at all — the padding mask is
the only masking an encoder-only model needs.`]})]}),`
`,e.jsx(i,{items:[{q:"Why must the tokenizer come from the same checkpoint as the model weights?",a:"The tokenizer defines which integer ID corresponds to which subword, and the model's embedding table was learned against exactly that mapping. A mismatched tokenizer feeds correct-looking IDs that index the wrong embedding rows, corrupting every input without raising an error."},{q:"What does a 0 in the attention mask do to the corresponding attention score?",a:"It drives that score to negative infinity before the softmax, so exp(-infinity) is zero and the padded position receives exactly zero attention weight."}]}),`
`,e.jsx(n.h2,{children:"Splitting the data"}),`
`,e.jsx(n.p,{children:"Before any training happens, the processed examples are divided into a training subset and a held-out validation subset."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from torch.utils.data import TensorDataset, DataLoader, random_split
import torch

labels = torch.tensor(all_labels)                 # 0 = negative, 1 = positive
dataset = TensorDataset(enc["input_ids"], enc["attention_mask"], labels)

n_val = int(0.2 * len(dataset))
train_ds, val_ds = random_split(
    dataset, [len(dataset) - n_val, n_val],
    generator=torch.Generator().manual_seed(42),
)

train_dl = DataLoader(train_ds, batch_size=16, shuffle=True)
val_dl   = DataLoader(val_ds,   batch_size=32)
`})}),`
`,e.jsx(n.p,{children:`The validation split is the only evidence you get that the model is learning the task rather than memorising the training
rows. Fine-tuning a model this large on a small labelled set overfits fast — often within two or three epochs — and
training loss alone will happily keep falling the entire time it happens.`}),`
`,e.jsx(n.h2,{children:"Adding the classification head"}),`
`,e.jsxs(s,{prompt:"Fine-tuning trains the newly added classification layer. Does it also update the pretrained encoder weights underneath?",options:["No — the encoder stays frozen and only the new head is trained","Yes — by default the encoder and the head are updated together"],correct:1,children:[e.jsxs(n.p,{children:["By default every parameter in ",e.jsx(n.code,{children:"model.parameters()"})," has ",e.jsx(n.code,{children:"requires_grad=True"}),`, so gradients flow all the way down through
all twelve encoder layers. That is the whole point: the general-purpose representations shift to suit `,e.jsx(n.em,{children:"your"}),` labels. The
head on its own is a single linear layer over a fixed feature — far too little capacity to specialise a general language
model to a specific task.`]}),e.jsx(n.p,{children:"This is exactly the freeze-versus-fine-tune spectrum from the Transfer Learning track:"}),e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Freeze the encoder"}),`, train only the head — fast, cheap, resistant to overfitting, and the right call when you have a
few hundred labelled examples. You are using BERT purely as a fixed feature extractor.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Fine-tune everything"})," — slower and hungrier for data, but reliably better once you have a few thousand labels."]}),`
`]}),e.jsx(n.p,{children:"Freezing is one line if you want it:"}),e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Optional: freeze the encoder, train the classification head only.
for param in model.bert.parameters():
    param.requires_grad = False
`})}),e.jsxs(n.p,{children:["Full fine-tuning is the default and the usual choice — with the caveat that it needs a ",e.jsx(n.em,{children:"small"}),` learning rate, typically
2e-5 to 5e-5. Anything larger overwrites the pretrained knowledge you paid to download, inside the first few hundred
steps.`]})]}),`
`,e.jsxs(s,{prompt:"The classification head is a single linear layer. Of all the token positions BERT outputs, which vector does that layer actually read?",options:["The average of every token vector in the sequence","The final-layer vector at the [CLS] position"],correct:1,children:[e.jsxs(n.p,{children:[e.jsx(n.code,{children:"[CLS]"}),` is prepended to every sequence and carries no word meaning of its own. Because BERT self-attention is
bidirectional, that position attends to every real token in the sentence at every layer — so its final-layer output is a
learned summary of the whole sequence. Pre-training deliberately trained it to be one, through the next-sentence-prediction
objective.`]}),e.jsx(n.p,{children:"The head is therefore tiny:"}),e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`# Conceptually, what AutoModelForSequenceClassification wraps around the encoder:
hidden = encoder(input_ids, attention_mask).last_hidden_state   # (batch, seq_len, 768)
pooled = hidden[:, 0]                                           # (batch, 768) — the [CLS] position
logits = nn.Linear(768, num_labels)(dropout(pooled))            # (batch, num_labels)
`})}),e.jsx(n.p,{children:`One linear layer, 768 inputs, one output per class. Nothing about the transformer architecture changes — no new attention
mechanism, no extra blocks, no altered depth. A general-purpose encoder becomes a sentiment classifier by attaching a
projection to a position that was already summarising the input, then letting gradients adjust that summary.`}),e.jsxs(n.p,{children:[`Mean-pooling over all token vectors (masking out the padding first) is a legitimate alternative and sometimes wins, but
`,e.jsx(n.code,{children:"[CLS]"})," is what the standard head uses."]})]}),`
`,e.jsx(i,{items:[{q:"Why is the [CLS] position a reasonable place to attach a sequence classifier?",a:"It has no word meaning of its own, and bidirectional self-attention lets it attend to every real token at every layer, so its final-layer vector acts as a learned summary of the whole sequence."},{q:"Why does fine-tuning use a learning rate around 2e-5 instead of a typical 1e-3?",a:"The encoder weights are already good. A large learning rate would overwrite the pretrained representations within the first few hundred steps, destroying the very knowledge the pretrained checkpoint was downloaded for."}]}),`
`,e.jsx(n.h2,{children:"The training loop"}),`
`,e.jsx(n.p,{children:`Nothing here is transformer-specific — it is the standard supervised loop, with the batch carrying an attention mask
alongside the token IDs.`}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from torch.optim import AdamW

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
optimizer = AdamW(model.parameters(), lr=2e-5)

for epoch in range(3):
    model.train()
    train_loss = 0.0
    for ids, mask, y in train_dl:
        ids, mask, y = ids.to(device), mask.to(device), y.to(device)

        out = model(input_ids=ids, attention_mask=mask, labels=y)
        loss = out.loss                  # cross-entropy, computed for you when labels are passed

        optimizer.zero_grad()
        loss.backward()                  # gradients reach the head AND every encoder layer
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        train_loss += loss.item()

    model.eval()
    correct = total = 0
    with torch.no_grad():
        for ids, mask, y in val_dl:
            ids, mask, y = ids.to(device), mask.to(device), y.to(device)
            preds = model(input_ids=ids, attention_mask=mask).logits.argmax(dim=-1)
            correct += (preds == y).sum().item()
            total += y.size(0)

    print(f"epoch {epoch}  train_loss {train_loss / len(train_dl):.4f}  val_acc {correct / total:.3f}")
`})}),`
`,e.jsxs(n.p,{children:[`Four things happen per batch: predict, compute the loss against the true labels, backpropagate, step the optimiser.
Passing `,e.jsx(n.code,{children:"labels="})," makes the model return the cross-entropy loss directly. ",e.jsx(n.code,{children:"model.eval()"})," and ",e.jsx(n.code,{children:"torch.no_grad()"}),` both
matter — the first disables dropout, the second skips gradient bookkeeping the validation pass has no use for.`]}),`
`,e.jsx(n.p,{children:`Watch the two numbers together. Training loss falling while validation accuracy stalls or drops is overfitting, and with a
model this large on a small dataset it usually shows up by epoch three.`}),`
`,e.jsx(n.h2,{children:"Inference"}),`
`,e.jsx(n.p,{children:`New text has to travel the identical tokenisation path — same tokenizer, same special tokens, same truncation length.
Any drift between training and inference preprocessing shows up as accuracy that mysteriously fails to reproduce.`}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`@torch.no_grad()
def classify(sentences, names=("negative", "positive")):
    model.eval()
    enc = tokenizer(sentences, padding=True, truncation=True,
                    max_length=64, return_tensors="pt").to(device)
    probs = model(**enc).logits.softmax(dim=-1)
    return [(names[p.argmax()], float(p.max())) for p in probs]

print(classify(["a genuinely moving film", "I want those two hours back"]))
# [('positive', 0.981), ('negative', 0.994)]
`})}),`
`,e.jsxs(n.p,{children:["Softmax turns the logits into probabilities over the target classes; ",e.jsx(n.code,{children:"argmax"}),` picks the predicted label, and the
probability itself is a usable confidence score — handy for routing low-confidence cases to a human.`]}),`
`,e.jsx(a,{title:"The whole point",children:e.jsx(n.p,{children:`Look back at what changed in the transformer itself: nothing. Same attention, same twelve layers, same feed-forward
blocks, same positional encodings. A pretrained general-purpose language encoder became a task-specific classifier
through one added linear layer and a few thousand gradient steps on labelled data — not through architectural surgery.
That separation, pre-train once on unlabelled text and fine-tune cheaply per task, is why the pretrained-encoder era
replaced training one bespoke model per problem.`})}),`
`,e.jsx(i,{items:[{q:"What must stay identical between training and inference preprocessing?",a:"The tokenizer, the special tokens inserted, the truncation length, and the padding and attention-mask handling — any drift means the model sees a different input distribution than the one it was trained on."},{q:"What architectural change does fine-tuning make to the transformer?",a:"None. The encoder architecture is untouched; a single linear classification layer is attached on top of the [CLS] representation, and the existing parameters are adjusted by gradient descent."}]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"The tokenizer and the model weights must come from the same checkpoint — the vocabulary mapping and the embedding table were learned together."}),`
`,e.jsx(n.li,{children:"The attention mask is Module 4's masking mechanism reused: padded positions get their scores set to negative infinity, so softmax gives them exactly zero weight."}),`
`,e.jsxs(n.li,{children:["Fine-tuning updates the pretrained encoder ",e.jsx(n.em,{children:"and"})," the new classification head together, at a small learning rate (2e-5 to 5e-5); freezing the encoder is the low-data alternative."]}),`
`,e.jsxs(n.li,{children:["The classifier reads the final-layer vector at the ",e.jsx(n.code,{children:"[CLS]"})," position — a sequence summary — through one linear layer. The transformer architecture itself is unchanged."]}),`
`]})}),`
`,e.jsx(l,{question:"Why does a padded position need an attention mask rather than simply being ignored?",options:["Padding tokens embed to a zero vector, so the mask is only a performance optimisation","The pad token has a real learned embedding and would otherwise receive genuine softmax probability, stealing weight from real tokens","Without a mask the sequence lengths would not match and the tensor could not be formed","The mask is required only for decoder models that generate text"],correct:1}),`
`,e.jsx(h,{question:"Which statements about fine-tuning BERT for classification are correct?",options:["By default, gradient updates reach both the classification head and the pretrained encoder layers","The classification head typically reads the final-layer representation at the [CLS] position","Fine-tuning requires adding extra attention layers to the pretrained encoder","A learning rate around 2e-5 is used to avoid overwriting the pretrained representations","The tokenizer can be taken from any checkpoint as long as the model architecture matches","Validation metrics are tracked alongside training loss because a large model overfits a small labelled set quickly","Inference must apply the same tokenisation, special tokens and truncation settings used during training"],correct:[0,1,3,5,6]})]})}function u(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(r,{...t})}):r(t)}export{u as default};
