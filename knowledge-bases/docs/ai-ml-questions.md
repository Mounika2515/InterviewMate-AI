# AI and Machine Learning Concepts Interview Questions

**Category:** AI/ML Concepts and Applications
**Target Roles:** AI/ML Engineer, Data Scientist
**Difficulty Levels:** Beginner, Intermediate, Advanced

---

## Q: What is the difference between AI, Machine Learning, and Deep Learning?

**Difficulty:** Beginner | **Topic:** Foundations

**Answer:**
- **Artificial Intelligence (AI)**: the broad field of making machines perform tasks that require human intelligence (reasoning, planning, perception, language).
- **Machine Learning (ML)**: a subset of AI where systems learn from data to improve performance without explicit programming.
- **Deep Learning (DL)**: a subset of ML using artificial neural networks with many layers (deep networks). Excels at unstructured data (images, text, audio) when large amounts of data and compute are available.

Relationship: DL ⊂ ML ⊂ AI. Most current breakthroughs (LLMs, image recognition) are DL.

**Key concepts:** hierarchy, unstructured data, data requirements, hardware (GPUs/TPUs)
**Follow-up:** When would you choose classical ML over deep learning?

---

## Q: What are Large Language Models (LLMs)?

**Difficulty:** Beginner | **Topic:** NLP / Generative AI

**Answer:**
LLMs are neural language models trained on massive text corpora using the transformer architecture. They learn statistical patterns of language and can generate coherent text, answer questions, translate, summarize, and reason. Examples: GPT-4, Claude, IBM Granite, LLaMA, Gemini. Key components: transformer architecture (attention mechanism), pretraining (next-token prediction on large text corpus), fine-tuning (adapting to specific tasks), RLHF (Reinforcement Learning from Human Feedback for alignment).

**Key concepts:** transformer, self-attention, pretraining, fine-tuning, RLHF, tokens
**Follow-up:** What is the context window of an LLM and why does it matter?

---

## Q: What is Retrieval-Augmented Generation (RAG)?

**Difficulty:** Intermediate | **Topic:** LLM Applications

**Answer:**
RAG combines a retrieval system with a generative LLM. When a query is received:
1. The query is embedded and used to retrieve relevant documents from a knowledge base (vector search).
2. The retrieved chunks are added to the LLM's prompt as context.
3. The LLM generates a response grounded in the retrieved content.

**Benefits:** reduces hallucinations, allows use of up-to-date or proprietary knowledge not in training data, more verifiable outputs with citations.
**Components:** embedding model, vector store, retriever, generator LLM.

**Key concepts:** hallucination reduction, grounding, vector similarity, context window, chunking
**Follow-up:** What are the main failure modes of RAG systems?

---

## Q: What is the transformer architecture?

**Difficulty:** Intermediate | **Topic:** Deep Learning / NLP

**Answer:**
The transformer (Vaswani et al., 2017 — "Attention Is All You Need") replaced RNNs for sequence modeling. Key components:
- **Self-attention**: each token attends to all other tokens, computing weighted sums based on relevance. Captures long-range dependencies.
- **Multi-head attention**: multiple attention heads capture different relationship types.
- **Positional encoding**: injects position information (since attention has no inherent notion of order).
- **Feed-forward layers**: applied position-wise after attention.
- **Encoder** (BERT): processes input bidirectionally. **Decoder** (GPT): generates output autoregressively.

**Key concepts:** attention, Q/K/V matrices, positional encoding, encoder-decoder, parallelization
**Follow-up:** What is the computational complexity of self-attention?

---

## Q: What is the difference between BERT and GPT?

**Difficulty:** Intermediate | **Topic:** NLP Models

**Answer:**
Both are transformer-based language models but with different architectures and training objectives:
- **BERT (Bidirectional Encoder Representations from Transformers)**: encoder-only. Pretrained with Masked Language Model (predict masked tokens) and Next Sentence Prediction. Sees full context (left and right). Best for: classification, NER, question answering, embeddings.
- **GPT (Generative Pretrained Transformer)**: decoder-only. Pretrained with causal language modeling (predict next token). Only sees left context. Best for: text generation, summarization, dialogue, completions.

**Key concepts:** encoder vs decoder, bidirectional vs unidirectional, pretraining objectives
**Follow-up:** What is T5 and how does it differ from both BERT and GPT?

---

## Q: What is prompt engineering?

**Difficulty:** Beginner | **Topic:** LLM Applications

**Answer:**
Prompt engineering is the practice of designing and optimizing input prompts to get the best outputs from LLMs. Techniques:
- **Zero-shot prompting**: provide only the task description.
- **Few-shot prompting**: provide examples (demonstrations) in the prompt.
- **Chain-of-thought prompting**: instruct the model to reason step by step before answering.
- **Role prompting**: assign a persona ("You are an expert in...").
- **System prompts**: set context and constraints before the conversation.

Good prompts are clear, specific, provide context, and specify the desired output format.

**Key concepts:** zero-shot, few-shot, chain-of-thought, role, system prompt, temperature
**Follow-up:** What is the difference between temperature and top-p in LLM generation?

---

## Q: What is fine-tuning an LLM? What are its alternatives?

**Difficulty:** Intermediate | **Topic:** LLM Training

**Answer:**
Fine-tuning updates a pretrained LLM's weights on a domain-specific or task-specific dataset to improve performance on that task. Full fine-tuning is expensive (updates all parameters).
**Alternatives:**
- **LoRA (Low-Rank Adaptation)**: adds small trainable low-rank matrices to frozen weights. Efficient, widely used.
- **PEFT (Parameter-Efficient Fine-Tuning)**: umbrella term for LoRA, prefix tuning, prompt tuning.
- **RAG**: retrieval-augmented generation — no weight updates needed; inject knowledge via context.
- **Prompt engineering**: guide behavior without any training.

**Key concepts:** parameter efficiency, LoRA, catastrophic forgetting, in-context learning vs fine-tuning
**Follow-up:** When would you choose RAG over fine-tuning?

---

## Q: What is hallucination in LLMs? How is it mitigated?

**Difficulty:** Intermediate | **Topic:** LLM Safety

**Answer:**
Hallucination is when an LLM generates confidently stated but factually incorrect or fabricated information. Causes: the model optimizes for fluent text, not factual accuracy; training data has errors; the model extrapolates beyond its knowledge.
**Mitigation strategies:**
- RAG: ground responses in retrieved documents.
- Structured prompts that instruct the model to say "I don't know" when uncertain.
- Output verification (self-consistency, external fact-checking).
- RLHF fine-tuning to reduce confident errors.
- Smaller, specialized models for specific domains.

**Key concepts:** grounding, factual accuracy, confidence calibration, RAG, RLHF
**Follow-up:** What is the difference between hallucination and a factual error?

---

## Q: What is a vector embedding?

**Difficulty:** Beginner | **Topic:** Representation Learning

**Answer:**
A vector embedding is a dense numerical representation of an object (word, sentence, image, document) in a high-dimensional space, where semantically similar objects are close together. Created by neural networks (word2vec, sentence transformers, CLIP). Applications: semantic search, RAG retrieval, recommendation systems, text clustering.
**Properties:** captures semantic meaning; distance (cosine similarity, dot product) measures similarity; dimensionality typically 384–1536 for text.

**Key concepts:** semantic similarity, cosine similarity, sentence transformers, vector search
**Follow-up:** What is the difference between cosine similarity and dot product for comparing embeddings?

---

## Q: What is a convolutional neural network (CNN)?

**Difficulty:** Intermediate | **Topic:** Computer Vision

**Answer:**
A CNN is a deep learning architecture designed for grid-like data (images, video). Key components:
- **Convolutional layers**: apply learnable filters to detect local patterns (edges, textures, objects). Weight sharing reduces parameters vs fully connected.
- **Pooling layers**: downsample spatial dimensions (max pooling, average pooling). Adds translational invariance.
- **Fully connected layers**: final classification head.

CNNs revolutionized computer vision (ImageNet challenge). Modern architectures: ResNet, VGG, EfficientNet. Now often replaced by Vision Transformers (ViT) for large-scale tasks.

**Key concepts:** convolution, receptive field, weight sharing, feature maps, pooling, residual connections
**Follow-up:** What is the purpose of residual connections in ResNet?

---

## Q: What is the attention mechanism in transformers?

**Difficulty:** Advanced | **Topic:** Deep Learning

**Answer:**
Attention allows each position in a sequence to focus on other positions. For each token, it computes a Query (Q), Key (K), and Value (V) vector. Attention score = softmax(QKᵀ/√d_k). The output is a weighted sum of V vectors. This lets the model learn which tokens are relevant to each other (e.g., pronoun → noun).
**Self-attention**: Q, K, V all come from the same sequence.
**Cross-attention**: Q from decoder, K and V from encoder.
**Multi-head attention**: run attention in parallel with different projections, concatenate results.

**Key concepts:** Q/K/V, scaled dot-product attention, softmax, d_k normalization, positional encoding
**Follow-up:** What is the computational complexity of self-attention w.r.t. sequence length?

---

## Q: What is reinforcement learning from human feedback (RLHF)?

**Difficulty:** Advanced | **Topic:** LLM Training

**Answer:**
RLHF is a technique to align LLMs with human preferences:
1. **Supervised fine-tuning (SFT)**: fine-tune the LLM on high-quality human-written examples.
2. **Reward model training**: human raters rank model outputs; train a reward model to predict these preferences.
3. **RL optimization**: use PPO (Proximal Policy Optimization) to fine-tune the LLM to maximize the reward model's score.
This process makes models more helpful, harmless, and honest. Used by ChatGPT, Claude, and others.

**Key concepts:** reward model, PPO, preference learning, alignment, constitutional AI
**Follow-up:** What is constitutional AI (CAI)?

---

## Q: What is a knowledge graph? How does it differ from a vector database?

**Difficulty:** Intermediate | **Topic:** Knowledge Representation

**Answer:**
- **Knowledge graph**: stores entities and their relationships as (subject, predicate, object) triples. Structured, explicit, queryable with SPARQL/Cypher. Examples: Wikidata, Google Knowledge Graph. Good for complex relational queries, multi-hop reasoning.
- **Vector database**: stores embeddings and enables approximate nearest-neighbor search. Unstructured, statistical, fuzzy matching. Examples: Milvus, Pinecone, ChromaDB. Good for semantic similarity search (RAG).

Knowledge graphs excel at explicit reasoning; vector databases at semantic retrieval. RAG systems typically use vector databases; agentic systems may use both.

**Key concepts:** triples, SPARQL, ANN search, cosine similarity, hybrid retrieval
**Follow-up:** What is a GraphRAG approach?

---

## Q: What are the main types of NLP tasks?

**Difficulty:** Beginner | **Topic:** NLP

**Answer:**
- **Text classification**: sentiment analysis, topic classification, spam detection.
- **Named Entity Recognition (NER)**: identifying persons, organizations, locations, dates in text.
- **Machine Translation**: translating between languages.
- **Text Summarization**: extractive (selects sentences) or abstractive (generates new text).
- **Question Answering**: extractive QA (finds answer span), generative QA (generates answer).
- **Information Extraction**: extracting structured data from unstructured text.
- **Text Generation**: open-ended generation, dialogue, storytelling.

**Key concepts:** sequence labeling, seq2seq, generative vs extractive, transformer-based solutions

---

## Q: What is model quantization?

**Difficulty:** Advanced | **Topic:** Model Optimization

**Answer:**
Quantization reduces the numerical precision of model weights (e.g., from 32-bit float to 8-bit integer or 4-bit integer). This reduces model size and inference latency with minimal accuracy loss.
- **Post-training quantization (PTQ)**: quantize after training. Fast, no retraining needed.
- **Quantization-aware training (QAT)**: simulate quantization during training. Better accuracy.
- **GGUF/GGML**: common quantized formats for running LLMs locally (LLaMA.cpp).

**Key concepts:** INT8, INT4, FP16, accuracy-size tradeoff, GPTQ, bitsandbytes
**Follow-up:** What is the difference between INT4 and FP16 quantization?

---

## Q: What is the difference between generative AI and discriminative AI?

**Difficulty:** Beginner | **Topic:** AI Fundamentals

**Answer:**
- **Discriminative models**: learn the boundary between classes. Given input X, predict label Y. Learn P(Y|X). Examples: logistic regression, SVM, BERT (classification head).
- **Generative models**: model the joint distribution P(X, Y) or generate new samples from P(X). Can generate data similar to training examples. Examples: GANs, VAEs, diffusion models, LLMs.

Generative AI has dominated recent progress — image generation (DALL-E, Stable Diffusion), text generation (GPT, Granite), audio/video synthesis.

**Key concepts:** discriminative vs generative, P(Y|X) vs P(X,Y), GANs, diffusion models, LLMs

---

## Q: What is IBM Granite?

**Difficulty:** Beginner | **Topic:** IBM AI / LLMs

**Answer:**
IBM Granite is IBM's family of foundation models designed for enterprise use cases. Key properties:
- Available in multiple sizes (3B to 34B+ parameters).
- Optimized for business tasks: code generation, text summarization, classification, Q&A.
- Designed with transparency and safety for enterprise deployment.
- Accessible via IBM watsonx.ai and IBM watsonx Orchestrate.
- Granite code models specialize in code understanding and generation across 116+ languages.

**Key concepts:** IBM watsonx, enterprise AI, foundation models, code generation, instruct models
**Follow-up:** How does IBM Granite differ from open-source models like LLaMA?

---

## Q: What is an AI agent?

**Difficulty:** Beginner | **Topic:** Agentic AI

**Answer:**
An AI agent is an LLM-powered system that can perceive inputs, reason, plan, and take actions (use tools) to accomplish goals — beyond simple question answering. Key components: LLM (reasoning engine), tools (APIs, databases, code execution), memory (conversation history, vector store), planning loop (ReAct, Plan-and-Execute).
Examples: an agent that searches the web, reads files, calls APIs, and synthesizes answers. IBM watsonx Orchestrate enables building multi-agent systems with specialized agents.

**Key concepts:** ReAct (Reason + Act), tool use, multi-agent systems, orchestration, autonomy
**Follow-up:** What is the difference between a single-agent and multi-agent system?

---

## Q: What is the difference between precision and recall in information retrieval?

**Difficulty:** Intermediate | **Topic:** Evaluation

**Answer:**
In information retrieval (search/RAG):
- **Precision**: fraction of retrieved documents that are relevant. High precision = few irrelevant results returned.
- **Recall**: fraction of relevant documents that were retrieved. High recall = few relevant documents missed.
- **Tradeoff**: retrieving more documents (high recall) usually includes more irrelevant results (lower precision).
- **F1**: harmonic mean, balances both.
- **NDCG (Normalized Discounted Cumulative Gain)**: considers ranking quality, not just set membership.

**Key concepts:** precision@K, recall@K, relevance judgment, RAG evaluation, NDCG
