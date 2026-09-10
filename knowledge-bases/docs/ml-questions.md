# Machine Learning Interview Questions

**Category:** Machine Learning
**Target Roles:** AI/ML Engineer, Data Scientist, Data Analyst
**Difficulty Levels:** Beginner, Intermediate, Advanced

---

## Q: What is the difference between supervised, unsupervised, and reinforcement learning?

**Difficulty:** Beginner | **Topic:** ML Fundamentals

**Answer:**
- **Supervised learning**: the model learns from labeled data (input-output pairs). Examples: classification, regression. Algorithms: linear regression, decision trees, SVMs, neural networks.
- **Unsupervised learning**: the model finds patterns in unlabeled data. Examples: clustering, dimensionality reduction. Algorithms: K-Means, PCA, autoencoders.
- **Reinforcement learning**: an agent learns by interacting with an environment, receiving rewards or penalties for actions. Examples: game playing, robotics. Algorithms: Q-learning, PPO.

**Key concepts:** labeled vs unlabeled data, feedback signal, generalization
**Follow-up:** Give a real-world example of each type.

---

## Q: What is overfitting and underfitting? How do you detect and prevent them?

**Difficulty:** Beginner | **Topic:** Model Evaluation

**Answer:**
- **Overfitting**: model learns training data too well (including noise), performs poorly on new data. Signs: high training accuracy, low validation accuracy.
- **Underfitting**: model is too simple to capture patterns. Signs: low accuracy on both training and validation sets.

**Prevention of overfitting**: regularization (L1/L2), dropout, early stopping, cross-validation, more training data, data augmentation, reducing model complexity.
**Prevention of underfitting**: more features, more complex model, longer training, better feature engineering.

**Key concepts:** bias-variance tradeoff, regularization, cross-validation
**Follow-up:** What is the bias-variance tradeoff?

---

## Q: Explain the bias-variance tradeoff.

**Difficulty:** Intermediate | **Topic:** Model Theory

**Answer:**
- **Bias**: error from overly simplistic assumptions. High bias → underfitting. Model cannot capture true patterns.
- **Variance**: error from sensitivity to small fluctuations in training data. High variance → overfitting. Model memorizes noise.
- **Tradeoff**: reducing bias often increases variance and vice versa. The goal is to find the model complexity that minimizes total error (bias² + variance + irreducible noise).

A simple model has high bias and low variance. A complex model has low bias and high variance.

**Key concepts:** model complexity, generalization, regularization
**Follow-up:** How does ensemble learning address the bias-variance tradeoff?

---

## Q: What is cross-validation? Why is it used?

**Difficulty:** Beginner | **Topic:** Model Evaluation

**Answer:**
Cross-validation is a technique to evaluate a model's performance on unseen data by splitting the dataset multiple times. In k-fold cross-validation, the data is split into k equal folds; the model trains on k-1 folds and validates on the remaining fold, repeating k times. Final performance is the average across all folds. It gives a more reliable estimate of generalization performance than a single train-test split, especially on small datasets.

**Key concepts:** k-fold, train-test-validation split, generalization, data leakage
**Follow-up:** What is stratified k-fold and when do you use it?

---

## Q: Explain precision, recall, F1 score, and when to use each.

**Difficulty:** Intermediate | **Topic:** Classification Metrics

**Answer:**
- **Precision** = TP / (TP + FP): of all predicted positives, how many are actually positive. Use when false positives are costly (e.g., spam detection — don't falsely mark real emails as spam).
- **Recall** = TP / (TP + FN): of all actual positives, how many did the model catch. Use when false negatives are costly (e.g., disease detection — don't miss actual cases).
- **F1 Score** = 2 × (Precision × Recall) / (Precision + Recall): harmonic mean of precision and recall. Use when you need a balance between the two, especially with class imbalance.

**Key concepts:** confusion matrix, TP/FP/TN/FN, class imbalance, ROC-AUC
**Follow-up:** When would you prefer ROC-AUC over F1 score?

---

## Q: What is a confusion matrix?

**Difficulty:** Beginner | **Topic:** Classification Metrics

**Answer:**
A confusion matrix is a table that summarizes classification model performance across all classes. For binary classification, it has four cells: True Positive (TP), True Negative (TN), False Positive (FP), False Negative (FN). TP and TN are correct predictions; FP and FN are errors. From the confusion matrix you can derive accuracy, precision, recall, F1, specificity, and other metrics. It is especially useful for understanding which classes are being confused.

**Key concepts:** TP, TN, FP, FN, multi-class confusion matrix
**Follow-up:** How does a confusion matrix extend to multi-class classification?

---

## Q: Explain gradient descent. What are its variants?

**Difficulty:** Intermediate | **Topic:** Optimization

**Answer:**
Gradient descent is an optimization algorithm that minimizes a loss function by iteratively updating model parameters in the direction of the negative gradient. The learning rate controls step size.
- **Batch gradient descent**: uses the full dataset per update. Stable but slow and memory-intensive.
- **Stochastic gradient descent (SGD)**: uses one sample per update. Fast but noisy.
- **Mini-batch gradient descent**: uses a small batch (e.g., 32-256 samples). Balance of speed and stability. Standard in deep learning.

**Key concepts:** learning rate, loss surface, convergence, local vs global minima
**Follow-up:** What is the vanishing gradient problem?

---

## Q: What is regularization? Explain L1 and L2 regularization.

**Difficulty:** Intermediate | **Topic:** Model Training

**Answer:**
Regularization adds a penalty to the loss function to discourage complex models and prevent overfitting.
- **L1 (Lasso)**: adds sum of absolute values of coefficients. Produces sparse models (drives some coefficients to exactly zero), useful for feature selection.
- **L2 (Ridge)**: adds sum of squared values of coefficients. Distributes weights more evenly; does not produce exact zeros. Better when most features are relevant.
- **Elastic Net**: combines L1 and L2.

**Key concepts:** penalty term, sparsity, feature selection, coefficient shrinkage
**Follow-up:** When would you choose L1 over L2 regularization?

---

## Q: What is the difference between a random forest and gradient boosting?

**Difficulty:** Intermediate | **Topic:** Ensemble Methods

**Answer:**
- **Random Forest**: bagging (bootstrap aggregating) ensemble of decision trees trained in parallel on random subsets of data and features. Final prediction is majority vote (classification) or average (regression). Reduces variance. Less prone to overfitting.
- **Gradient Boosting** (XGBoost, LightGBM): boosting ensemble where trees are trained sequentially, each correcting the errors of the previous. Reduces bias. Highly accurate but slower to train, more prone to overfitting without tuning.

**Key concepts:** bagging vs boosting, variance vs bias reduction, ensemble learning
**Follow-up:** What hyperparameters are most important to tune in XGBoost?

---

## Q: What is PCA (Principal Component Analysis)?

**Difficulty:** Intermediate | **Topic:** Dimensionality Reduction

**Answer:**
PCA is an unsupervised dimensionality reduction technique. It finds orthogonal axes (principal components) that capture the maximum variance in the data. The first principal component captures the most variance, the second captures the most remaining variance, and so on. It projects high-dimensional data into a lower-dimensional space, reducing noise, storage, and computation. PCA is a linear transformation; it does not work well for non-linear relationships (use t-SNE or UMAP for visualization).

**Key concepts:** eigenvalues, eigenvectors, variance explained, linear transformation
**Follow-up:** How do you decide how many principal components to keep?

---

## Q: What is the difference between classification and regression?

**Difficulty:** Beginner | **Topic:** ML Fundamentals

**Answer:**
- **Classification**: predicts a discrete label or category. Output is a class (e.g., spam/not spam, cat/dog, 0-9 digit). Metrics: accuracy, precision, recall, F1, AUC.
- **Regression**: predicts a continuous value. Output is a number (e.g., house price, temperature, stock return). Metrics: MAE, MSE, RMSE, R².

Both are supervised learning tasks. Some algorithms (logistic regression, SVMs, neural networks) can be used for both with adjustments.

**Key concepts:** output type, loss function, evaluation metrics
**Follow-up:** When is logistic regression used for classification despite having "regression" in its name?

---

## Q: What is K-Means clustering? What are its limitations?

**Difficulty:** Intermediate | **Topic:** Unsupervised Learning

**Answer:**
K-Means partitions n data points into k clusters by minimizing within-cluster variance. Algorithm: initialize k centroids, assign each point to nearest centroid, update centroids as cluster means, repeat until convergence.
**Limitations:** must specify k in advance; sensitive to initial centroid positions (use k-means++); assumes spherical, equal-size clusters; sensitive to outliers; struggles with non-convex shapes.

**Key concepts:** centroid, inertia, Elbow method, k-means++, silhouette score
**Follow-up:** How do you choose the optimal k in K-Means?

---

## Q: What is a decision tree? How does it decide which feature to split on?

**Difficulty:** Beginner | **Topic:** Algorithms

**Answer:**
A decision tree recursively splits data into subsets based on feature values to minimize impurity at each node. For classification, splitting criteria include Gini impurity (used by sklearn) and information gain (entropy-based, used by ID3/C4.5). For regression, uses variance reduction (MSE). The tree grows until a stopping condition is met: max depth, min samples per leaf, or pure nodes. Decision trees are interpretable but prone to overfitting.

**Key concepts:** Gini impurity, entropy, information gain, pruning, leaf node
**Follow-up:** How does pruning improve a decision tree?

---

## Q: What is the ROC curve and AUC?

**Difficulty:** Intermediate | **Topic:** Model Evaluation

**Answer:**
The ROC (Receiver Operating Characteristic) curve plots True Positive Rate (recall) against False Positive Rate at various classification thresholds. AUC (Area Under the Curve) summarizes the curve as a single number: 1.0 = perfect classifier, 0.5 = random guessing, below 0.5 = worse than random. AUC is threshold-independent and works well for binary classification and imbalanced datasets. The curve shows the tradeoff between sensitivity and specificity.

**Key concepts:** TPR, FPR, threshold, class imbalance, calibration
**Follow-up:** What is the difference between micro-averaged and macro-averaged AUC for multi-class?

---

## Q: What is feature engineering? Give examples.

**Difficulty:** Intermediate | **Topic:** Data Preparation

**Answer:**
Feature engineering is the process of using domain knowledge to create, transform, or select features that improve model performance. Examples:
- **Encoding**: one-hot encoding for categorical variables, ordinal encoding for ordinal data.
- **Normalization/Scaling**: standard scaling (z-score), min-max scaling for distance-based algorithms.
- **Date features**: extracting day of week, month, hour from timestamps.
- **Interaction features**: multiplying or combining features (e.g., price × quantity).
- **Log transformation**: reducing skewness in distributions.
- **Binning**: converting continuous to categorical.

**Key concepts:** domain knowledge, encoding, scaling, transformation

---

## Q: What is a hyperparameter? How do you tune hyperparameters?

**Difficulty:** Intermediate | **Topic:** Model Optimization

**Answer:**
A hyperparameter is a configuration value set before training (not learned from data). Examples: learning rate, number of trees, max depth, regularization strength, number of layers. Tuning strategies:
- **Grid search**: exhaustive search over a predefined grid. Guaranteed to find best in grid but slow.
- **Random search**: samples random combinations. Often faster and comparable to grid search.
- **Bayesian optimization**: builds a probabilistic model of objective function to choose next hyperparameter set.
- **Early stopping**: monitor validation loss and stop when it stops improving.

**Key concepts:** search space, overfitting the validation set, cross-validation during tuning

---

## Q: What is the difference between bagging and boosting?

**Difficulty:** Intermediate | **Topic:** Ensemble Methods

**Answer:**
- **Bagging (Bootstrap Aggregating)**: trains multiple models in parallel on different random subsets of training data (with replacement). Final prediction averages or votes. Reduces variance. Example: Random Forest.
- **Boosting**: trains models sequentially, each focusing on the errors of the previous. Final prediction is a weighted combination. Reduces bias. More prone to overfitting. Example: AdaBoost, XGBoost, LightGBM.

**Key concepts:** variance vs bias, parallel vs sequential, weighted voting
**Follow-up:** What is stacking (stacked generalization)?

---

## Q: Explain the vanishing gradient problem and solutions to it.

**Difficulty:** Advanced | **Topic:** Deep Learning

**Answer:**
During backpropagation in deep networks, gradients are multiplied by weights layer-by-layer. If weights are small (< 1), gradients shrink exponentially as they propagate backward, making early layers train very slowly or not at all. Solutions:
- **ReLU activation**: avoids saturation unlike sigmoid/tanh for positive inputs.
- **Batch normalization**: normalizes layer outputs to stabilize gradients.
- **Residual connections** (ResNet): skip connections allow gradients to flow directly to earlier layers.
- **Gradient clipping**: caps gradient magnitude.
- **Weight initialization**: Xavier/He initialization prevents exploding/vanishing at initialization.

**Key concepts:** backpropagation, activation functions, ResNet, batch normalization

---

## Q: What is transfer learning and when is it used?

**Difficulty:** Intermediate | **Topic:** Deep Learning

**Answer:**
Transfer learning uses a model trained on one task as a starting point for a different but related task. Common in computer vision (pretrained ImageNet CNNs) and NLP (BERT, GPT). The pretrained model has learned useful representations (edge detectors, word embeddings) that apply broadly. You either **freeze** the pretrained layers (only train the new head) or **fine-tune** all layers on the new dataset.
Use when: your dataset is small, compute is limited, the source and target domains are related.

**Key concepts:** pretrained models, fine-tuning, feature extraction, domain adaptation

---

## Q: What is the curse of dimensionality?

**Difficulty:** Intermediate | **Topic:** ML Theory

**Answer:**
As the number of features (dimensions) increases, the volume of the feature space grows exponentially. This causes data to become sparse — points become far from each other, making distance-based algorithms (KNN, K-Means) unreliable. More data is needed to maintain the same density. Algorithms perform well in low dimensions but degrade in high dimensions. Solutions: dimensionality reduction (PCA, t-SNE), feature selection, regularization.

**Key concepts:** high-dimensional spaces, sparsity, KNN, feature selection

---

## Q: What is the difference between a parametric and non-parametric model?

**Difficulty:** Advanced | **Topic:** Model Theory

**Answer:**
- **Parametric**: assumes a fixed functional form with a fixed number of parameters. After training, only the parameters are needed (not the training data). Examples: linear regression, logistic regression, neural networks. Fast inference, less flexible.
- **Non-parametric**: makes no fixed assumption about functional form; the complexity can grow with data. Requires storing training data for inference. Examples: KNN, kernel SVM, decision trees, random forests. More flexible, can capture complex patterns, but slower and higher memory.

**Key concepts:** model capacity, inference cost, assumptions, flexibility

---

## Q: What is data leakage in machine learning?

**Difficulty:** Intermediate | **Topic:** Data Preparation

**Answer:**
Data leakage occurs when information from outside the training dataset (typically from the test set or future data) is used to build the model, leading to overly optimistic performance estimates. Common causes: normalizing the full dataset before splitting (the test set statistics influence the training set transformation), including target-correlated features that would not be available at prediction time, or temporal leakage (using future data to predict the past). Prevention: always fit preprocessing (scalers, encoders) only on training data, then transform test data using the same fitted transformer.

**Key concepts:** train-test contamination, pipelines, temporal leakage, realistic evaluation

---

## Q: What is a neural network? Describe a basic feedforward network.

**Difficulty:** Beginner | **Topic:** Deep Learning

**Answer:**
A neural network is a computational model loosely inspired by biological neurons. A feedforward neural network consists of: an input layer (one neuron per feature), one or more hidden layers (fully connected neurons with activation functions), and an output layer (one neuron per class or one neuron for regression). Forward pass: data flows input → hidden → output. Backward pass (backpropagation): loss gradient flows backward to update weights via gradient descent. Activation functions (ReLU, sigmoid, tanh) introduce non-linearity.

**Key concepts:** layers, weights, biases, activation functions, backpropagation, loss function
