import{u as i,j as e,C as a,B as d,R as r,Q as c,M as h}from"./index-Ba5-wm3B.js";import{P as o}from"./PredictReveal-CQqAapoB.js";function s(n){const t={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{children:"Module 12: Translation and Question Answering"}),`
`,e.jsxs(a,{title:"Run the code",children:[e.jsxs(t.p,{children:[`Every code block in this track is collected into one runnable notebook:
`,e.jsx(t.strong,{children:e.jsx(t.a,{href:"https://colab.research.google.com/github/jeevchiran/learnings-ai-ml/blob/main/notebook/transformers/transformers-lab.ipynb",children:"Open the Transformers lab in Google Colab"})}),"."]}),e.jsx(t.p,{children:`It runs top to bottom on a fresh runtime — MarianMT translating English to French, T5 answering questions from a context
passage, and the extractive alternative for contrast. These cells download pretrained weights from the Hugging Face Hub,
so they need an internet connection (Colab has one). Not executed in this module — read the code here, run it in Colab
when you want the actual outputs.`})]}),`
`,e.jsx(d,{children:e.jsx(t.p,{children:"Module 11 fine-tuned an encoder-only model: BERT plus a classification head, one label out per input. But a label is not a sequence. This module goes back to the encoder-decoder family from Module 10 — the one built specifically to turn one sequence into a different sequence — and puts it to work on two canonical tasks: machine translation, which generates a target-language sentence from a source-language one, and question answering, which analyses a context passage to produce the answer to a question. The first one is worth pausing on. The Attention and Encoder-Decoder track spent an entire track building a translation model with RNNs: an encoder loop, a decoder loop, attention wired between them, a training run, BLEU scoring at the end. Here the same task takes about five lines, because someone else already did the training and shipped the weights."})}),`
`,e.jsx(t.h2,{children:"Why translation needs both halves"}),`
`,e.jsxs(o,{prompt:"BERT is a strong encoder — it produces rich contextual representations of every input token. Could you translate a sentence with BERT alone, no decoder?",options:["Yes, just read the translation off the encoder outputs","No — the encoder gives one vector per input token, but translation needs to emit a new sequence of different length in a different vocabulary"],correct:1,children:[e.jsx(t.p,{children:"An encoder gives you exactly as many output vectors as you fed in tokens, each one aligned to a source-language position. A translation is a different sequence: different length, different vocabulary, different word order. There is nothing in the encoder output to read the target sentence off of."}),e.jsx(t.p,{children:"The decoder is the part that generates. It emits target tokens one at a time, and at each step it can look at two things — the target tokens it has already produced, through masked self-attention, and the full encoder representation of the source, through cross-attention. That is the whole shape of the task: read all of the source, write the target left to right."})]}),`
`,e.jsx(t.h2,{children:"Machine translation with MarianMT"}),`
`,e.jsxs(t.p,{children:["MarianMT is an encoder-decoder transformer built specifically for machine translation, trained on large multilingual corpora, and published through the Hugging Face Transformers library with one pretrained checkpoint per language pair. The ",e.jsx(t.code,{children:"pipeline"})," helper hides the plumbing."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`from transformers import pipeline

# Downloads pretrained MarianMT weights for the English-to-French pair.
translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-fr")

sentences = [
    "The transformer replaced recurrence with attention.",
    "She left the meeting early because the train was delayed.",
]

for src in sentences:
    out = translator(src, max_length=64)[0]["translation_text"]
    print(f"EN: {src}")
    print(f"FR: {out}\\n")
`})}),`
`,e.jsx(t.p,{children:"Translated outputs come back as plain strings, which makes this easy to poke at: put the source and the target side by side, then change the source — add a subordinate clause, an ambiguous pronoun, an idiom — and watch how structural changes in the input move the translation around."}),`
`,e.jsx(t.h3,{children:"What the pipeline is actually doing"}),`
`,e.jsxs(o,{prompt:"The decoder generates the French sentence one token at a time. At each step, what is it conditioned on?",options:["Only the encoder output for the source sentence","Both the encoder output for the whole source sentence and every target token it has already generated"],correct:1,children:[e.jsx(t.p,{children:"Four steps run for every source sentence handed to the pipeline:"}),e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Tokenise."})," The source text is split into subword tokens from the model's vocabulary and mapped to integer IDs."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Encode."})," The encoder processes the whole source sequence at once, producing a contextual representation of each source token."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Decode."})," The decoder generates the translated sequence one token at a time. Each step attends over the encoder representations through cross-attention, and over the target tokens already emitted through masked self-attention, then picks the next token."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Detokenise."})," The generated token IDs are converted back into the final target-language string."]}),`
`]}),e.jsx(t.p,{children:"Conditioning on both is what makes the output a coherent sentence rather than a bag of individually plausible words. Drop the previously generated tokens and the decoder has no idea what it has already said; drop the encoder output and it is not translating anything, just producing fluent French at random."}),e.jsx(t.p,{children:"The same four steps without the pipeline wrapper, so you can see where each one lives:"}),e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`from transformers import MarianMTModel, MarianTokenizer

name = "Helsinki-NLP/opus-mt-en-fr"
tokenizer = MarianTokenizer.from_pretrained(name)      # downloads weights: needs internet
model = MarianMTModel.from_pretrained(name)

batch = tokenizer(["The transformer replaced recurrence with attention."],
                  return_tensors="pt", padding=True)          # step 1: tokenise

generated = model.generate(**batch, max_length=64)             # steps 2 and 3: encode once, decode token by token

print(tokenizer.batch_decode(generated, skip_special_tokens=True))   # step 4: detokenise
`})}),e.jsxs(t.p,{children:[e.jsx(t.code,{children:"model.generate"})," is the loop: it runs the encoder once, then calls the decoder repeatedly, feeding each new token back in, until the model emits its end-of-sequence token or hits ",e.jsx(t.code,{children:"max_length"}),"."]})]}),`
`,e.jsx(r,{items:[{q:"Why does the encoder only need to run once per translation, while the decoder runs many times?",a:"The source sentence never changes during generation, so its encoder representation is computed once and reused. The target sentence grows one token at a time, so the decoder must run once per generated token, each time attending over the fixed encoder output plus the tokens produced so far."}]}),`
`,e.jsx(t.h2,{children:"Question answering with T5"}),`
`,e.jsx(t.p,{children:"T5, the Text-to-Text Transfer Transformer, is an encoder-decoder model with a deliberately uniform interface: a wide range of tasks are converted into one text-in, text-out format. Classification, summarisation, translation, question answering — all the same signature, only the string formatting differs."}),`
`,e.jsxs(o,{prompt:"T5 handles question answering. Since QA means finding an answer inside a passage, does T5 output the start and end positions of the answer span?",options:["Yes, it predicts two indices into the context","No — T5 generates the answer as text, one token at a time, like any other T5 output"],correct:1,children:[e.jsx(t.p,{children:"This is the distinction worth being precise about, because the two designs get conflated constantly."}),e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"T5 is generative."})," Each example is a question plus a context passage containing the answer. The two are concatenated into a single model input and tokenised. The encoder processes that combined input, and the decoder then ",e.jsx(t.em,{children:"generates"})," the answer as a sequence of tokens — a string, produced exactly the way a translation is produced. T5 is not selecting indices; it is writing."]}),e.jsxs(t.p,{children:[e.jsx(t.strong,{children:"BERT-style extractive QA is different."})," Models like ",e.jsx(t.code,{children:"BertForQuestionAnswering"})," are encoder-only. They put two small heads on top of the encoder outputs that predict a start position and an end position over the context tokens, and the answer is the literal slice of the context between them. Those models genuinely do output span indices."]}),e.jsx(t.p,{children:"The practical consequence: an extractive model can only ever return text that appears verbatim in the context, which is a useful safety rail. T5 can paraphrase, reformat, or in principle answer with something not in the passage at all — more flexible, less constrained."}),e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`from transformers import pipeline

# T5 is text-to-text: the task is signalled by how the input string is formatted.
qa = pipeline("text2text-generation", model="t5-base")     # downloads weights: needs internet

context = (
    "The transformer architecture was introduced in 2017. It removed recurrence "
    "entirely and relied on self-attention, which made training far easier to parallelise."
)
question = "What did the transformer architecture remove?"

prompt = f"question: {question}  context: {context}"       # question and context in one input
print(qa(prompt, max_length=32)[0]["generated_text"])      # the answer text, generated
`})}),e.jsx(t.p,{children:"And the extractive alternative for contrast — note that it returns positions, which the pipeline then slices out of the context for you:"}),e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-python",children:`# Encoder-only, span-predicting QA. Same task, different output type.
extractive = pipeline("question-answering", model="distilbert-base-cased-distilled-squad")

result = extractive(question=question, context=context)
print(result["answer"], result["start"], result["end"])    # answer text plus its span indices
`})})]}),`
`,e.jsx(r,{items:[{q:"How does T5 know it is being asked to do question answering rather than translation or summarisation?",a:"From the text formatting of the input itself. T5 was trained with task prefixes, so labelling the parts of the input string selects the behaviour — there is no separate task-specific head to swap in."},{q:"What is the one thing an extractive QA model guarantees that a generative one does not?",a:"That the answer appears verbatim in the context passage, because it returns a literal slice of the context defined by predicted start and end positions rather than freely generated text."}]}),`
`,e.jsx(t.hr,{}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"Translation needs an encoder-decoder because the output is a new sequence of different length and vocabulary — an encoder alone only gives one vector per input token."}),`
`,e.jsx(t.li,{children:"MarianMT translation runs four steps: tokenise the source, encode it once, decode the target one token at a time, detokenise the result."}),`
`,e.jsx(t.li,{children:"At every generation step the decoder is conditioned on both the encoder output for the whole source and the target tokens it has already produced."}),`
`,e.jsxs(t.li,{children:["T5 frames QA as text-to-text and ",e.jsx(t.em,{children:"generates"})," the answer string; BERT-style extractive QA is encoder-only and instead predicts start and end token positions over the context."]}),`
`]})}),`
`,e.jsx(c,{question:"A translation task is a poor fit for an encoder-only model like BERT primarily because:",options:["BERT is too small to hold two languages","The encoder produces one representation per input token and cannot generate a new sequence of different length in a different vocabulary","BERT has no attention mechanism","Encoder-only models cannot be pretrained on multilingual data"],correct:1}),`
`,e.jsx(h,{question:"Which statements about these two tasks and models are correct?",options:["MarianMT is an encoder-decoder model trained specifically for machine translation","The MarianMT encoder runs once per source sentence, while the decoder runs once per generated token","T5 predicts start and end indices to locate the answer inside the context passage","T5 generates the answer as text, using the same decoding process it uses for any other output","BERT-style extractive QA models predict start and end token positions over the context","For T5 question answering, the question and the context are concatenated into a single tokenised input"],correct:[0,1,3,4,5]})]})}function p(n={}){const{wrapper:t}={...i(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}export{p as default};
