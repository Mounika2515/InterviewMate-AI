# Data Structures and Algorithms Interview Questions

**Category:** Data Structures and Algorithms (DSA)
**Target Roles:** Software Developer, AI/ML Engineer
**Difficulty Levels:** Beginner, Intermediate, Advanced

---

## Q: What is the difference between an array and a linked list?

**Difficulty:** Beginner | **Topic:** Linear Data Structures

**Answer:**
- **Array**: stores elements in contiguous memory. Random access O(1) by index. Insertion/deletion in the middle O(n) due to shifting. Fixed size in most languages (dynamic arrays like Python lists resize by doubling).
- **Linked List**: elements (nodes) stored anywhere in memory, each pointing to the next. No random access — traversal is O(n). Insertion/deletion at head O(1), at arbitrary position O(n) to find + O(1) to insert. Dynamic size with no wasted capacity.

**Key concepts:** contiguous memory, pointers, cache locality (arrays are cache-friendly), dynamic sizing
**Follow-up:** When would you prefer a linked list over an array?

---

## Q: Explain Big O notation. What are the most common complexities?

**Difficulty:** Beginner | **Topic:** Complexity Analysis

**Answer:**
Big O notation describes the worst-case growth rate of an algorithm's time or space as input size n grows. Common complexities (best to worst):
- O(1): constant — hash map lookup, array index access.
- O(log n): logarithmic — binary search, balanced BST operations.
- O(n): linear — linear search, single-pass array traversal.
- O(n log n): log-linear — merge sort, heap sort, efficient sorting algorithms.
- O(n²): quadratic — bubble sort, insertion sort, nested loops.
- O(2ⁿ): exponential — recursive Fibonacci without memoization.
- O(n!): factorial — brute-force permutation generation.

**Key concepts:** asymptotic analysis, worst/average/best case, space complexity
**Follow-up:** What is amortized time complexity?

---

## Q: What is a stack? What is a queue? Where are they used?

**Difficulty:** Beginner | **Topic:** Linear Data Structures

**Answer:**
- **Stack**: LIFO (Last In, First Out). Operations: push (add to top), pop (remove from top), peek (view top). O(1) for all. Uses: function call stack, undo/redo, expression parsing, DFS.
- **Queue**: FIFO (First In, First Out). Operations: enqueue (add to back), dequeue (remove from front). O(1) for both. Uses: BFS, task scheduling, print spooler, message queues.

Python: use `deque` from `collections` for both (O(1) from both ends). Lists give O(n) dequeue.

**Key concepts:** LIFO, FIFO, `collections.deque`, monotonic stack/queue
**Follow-up:** What is a priority queue and how is it implemented?

---

## Q: What is a binary search tree (BST)? What are its properties?

**Difficulty:** Beginner | **Topic:** Trees

**Answer:**
A BST is a binary tree where for each node: all left subtree values are less than the node's value, and all right subtree values are greater. This property enables efficient search, insert, and delete: O(log n) for a balanced tree. Inorder traversal of a BST yields sorted order. Degenerate case: inserting sorted data creates a linear tree (O(n) operations) — use self-balancing trees (AVL, Red-Black) to avoid this.

**Key concepts:** BST property, balanced vs unbalanced, AVL tree, inorder traversal
**Follow-up:** How does an AVL tree maintain balance?

---

## Q: Explain binary search. When can it be applied?

**Difficulty:** Beginner | **Topic:** Searching

**Answer:**
Binary search finds a target in a sorted array by repeatedly halving the search space. Compare target to the middle element: if equal, found; if target < middle, search left half; if target > middle, search right half. Time complexity: O(log n). Space: O(1) iteratively, O(log n) recursively.
**Requirements:** the array must be sorted (or the search space must have a monotonic property). Also applies to: finding first/last occurrence, searching on rotated arrays, finding minimum in rotated array, any problem where you can binary search on the answer.

**Key concepts:** sorted array, divide and conquer, monotonicity, O(log n)
**Follow-up:** How do you implement binary search to find the leftmost position of a target?

---

## Q: What is a hash table? How does it handle collisions?

**Difficulty:** Intermediate | **Topic:** Hash Structures

**Answer:**
A hash table stores key-value pairs using a hash function to compute an index (bucket) from the key. Average O(1) for get, put, delete. Collisions (two keys map to the same index) are handled by:
- **Chaining**: each bucket stores a linked list. Lookup O(1) average, O(n) worst (all keys hash to same bucket).
- **Open addressing** (linear/quadratic probing, double hashing): probe for the next empty slot. More cache-friendly.
Load factor (elements/buckets) determines when to resize (rehash). Python's dict uses open addressing with a custom hash.

**Key concepts:** hash function, collision resolution, load factor, rehashing
**Follow-up:** What happens if the hash function has poor distribution?

---

## Q: What is a heap? What are its use cases?

**Difficulty:** Intermediate | **Topic:** Trees

**Answer:**
A heap is a complete binary tree satisfying the heap property: in a max-heap, each parent ≥ children; in a min-heap, each parent ≤ children. Implemented efficiently as an array. Key operations: insert O(log n), extract-min/max O(log n), peek O(1), build-heap O(n).
**Use cases:** priority queues, heap sort, top-K problems (find K largest/smallest elements), Dijkstra's shortest path, merge K sorted lists.

Python: `heapq` module implements a min-heap. Negate values for max-heap.

**Key concepts:** heap property, complete binary tree, `heapq`, priority queue
**Follow-up:** How do you find the K largest elements using a heap in O(n log k)?

---

## Q: Explain depth-first search (DFS) and breadth-first search (BFS).

**Difficulty:** Beginner | **Topic:** Graph Algorithms

**Answer:**
- **DFS**: explores as far as possible along each branch before backtracking. Uses a stack (explicitly or via recursion). O(V+E) time. Use for: topological sort, cycle detection, connected components, maze solving, tree traversal.
- **BFS**: explores all neighbors at the current depth before moving deeper. Uses a queue. O(V+E) time. Use for: shortest path in unweighted graph, level-order traversal, finding nearest neighbor.

**Key concepts:** V (vertices), E (edges), stack vs queue, visited set, shortest path
**Follow-up:** How do you detect a cycle in a directed graph?

---

## Q: What is dynamic programming? What are its key properties?

**Difficulty:** Intermediate | **Topic:** Algorithms

**Answer:**
Dynamic programming (DP) solves problems by breaking them into overlapping subproblems and storing results (memoization/tabulation) to avoid recomputation. Key properties:
1. **Optimal substructure**: optimal solution contains optimal solutions to subproblems.
2. **Overlapping subproblems**: same subproblems are solved multiple times.

Approaches:
- **Top-down (memoization)**: recursive with caching.
- **Bottom-up (tabulation)**: iterative, builds table from base cases.

Classic problems: Fibonacci, longest common subsequence, 0/1 knapsack, shortest path (Bellman-Ford), edit distance.

**Key concepts:** memoization, tabulation, state, recurrence relation
**Follow-up:** What is the difference between DP and greedy algorithms?

---

## Q: What is a graph? What are common representations?

**Difficulty:** Beginner | **Topic:** Graphs

**Answer:**
A graph G = (V, E) consists of vertices (nodes) and edges (connections). Types: directed/undirected, weighted/unweighted, cyclic/acyclic.
**Representations:**
- **Adjacency matrix**: V×V matrix, `matrix[i][j]` = 1 or weight if edge exists. Space O(V²). Fast edge lookup O(1). Good for dense graphs.
- **Adjacency list**: array/dict of V lists, each listing neighbors. Space O(V+E). Faster traversal for sparse graphs. Standard for most algorithms.
- **Edge list**: list of (u,v) tuples. Simple, used when processing edges one at a time.

**Key concepts:** directed vs undirected, sparse vs dense, space-time tradeoffs
**Follow-up:** How do you represent a weighted graph as an adjacency list?

---

## Q: What is topological sorting? When is it used?

**Difficulty:** Intermediate | **Topic:** Graph Algorithms

**Answer:**
Topological sort orders the vertices of a directed acyclic graph (DAG) such that for every directed edge (u→v), u comes before v. Only valid for DAGs (directed, acyclic). Algorithms: Kahn's algorithm (BFS using in-degree), DFS-based (add to stack on finish).
**Use cases:** task scheduling (build dependencies), course prerequisites, package installation order, evaluating mathematical expressions.

**Key concepts:** DAG, in-degree, DFS post-order, cycle detection
**Follow-up:** How does Kahn's algorithm detect cycles?

---

## Q: Explain merge sort and its time/space complexity.

**Difficulty:** Intermediate | **Topic:** Sorting

**Answer:**
Merge sort is a divide-and-conquer sorting algorithm. Divide the array in half recursively until arrays have one element (base case), then merge pairs of sorted arrays.
- **Time complexity**: O(n log n) — log n levels of recursion, O(n) to merge at each level. Guaranteed in all cases.
- **Space complexity**: O(n) auxiliary space for the merge step.
- **Stable**: preserves relative order of equal elements.
- **Good for**: linked lists (no random access needed), external sorting, when stable sort is required.

**Key concepts:** divide and conquer, stable sort, O(n log n), external sort
**Follow-up:** How does merge sort differ from quicksort in terms of practical performance?

---

## Q: What is quicksort? What is its average and worst-case complexity?

**Difficulty:** Intermediate | **Topic:** Sorting

**Answer:**
Quicksort is a divide-and-conquer sort that picks a pivot element, partitions the array so that elements less than pivot are on the left and greater on the right, then recursively sorts both partitions.
- **Average case**: O(n log n) — when pivot divides array roughly in half each time.
- **Worst case**: O(n²) — when pivot is always the smallest or largest element (e.g., sorted input with last-element pivot). Avoided with random pivot selection or median-of-three.
- **Space**: O(log n) average (call stack). O(1) extra space in-place.
- **Not stable** by default. Fastest in practice for in-memory sorts due to cache locality.

**Key concepts:** pivot selection, partition, in-place, cache efficiency, O(n log n) average
**Follow-up:** How does Python's `sorted()` (Timsort) compare to quicksort?

---

## Q: What is a trie (prefix tree)? What problems does it solve?

**Difficulty:** Intermediate | **Topic:** Trees

**Answer:**
A trie is a tree data structure where each node represents a character, and paths from root to leaf represent strings. Insert, search, and prefix search are O(L) where L is string length.
**Use cases:** autocomplete/type-ahead, spell checking, IP routing, word puzzles.
**Advantages over hash map for strings:** supports prefix queries, no hash collisions, alphabetical ordering.

**Key concepts:** prefix matching, alphabet branching, O(L) operations, compressed trie (Patricia trie)
**Follow-up:** How much memory does a trie use compared to storing strings in a hash set?

---

## Q: What is a sliding window technique?

**Difficulty:** Intermediate | **Topic:** Algorithms

**Answer:**
The sliding window technique uses two pointers (left and right) defining a window over a sequence, sliding them to avoid redundant recomputation. Instead of recomputing the window from scratch for each position, you add the new element (right pointer) and remove the old element (left pointer). Reduces brute force O(n²) solutions to O(n).
**Use cases:** maximum sum subarray of size k, longest substring without repeating characters, minimum window substring.

**Key concepts:** two pointers, window expansion/contraction, O(n), substring problems
**Follow-up:** What is the difference between a fixed-size and variable-size sliding window?

---

## Q: Explain Dijkstra's algorithm.

**Difficulty:** Intermediate | **Topic:** Graph Algorithms

**Answer:**
Dijkstra's finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative weights.
Algorithm: initialize source distance to 0, all others to infinity. Use a min-heap (priority queue). Repeatedly extract the vertex with minimum distance, relax all its edges (update neighbor distances if shorter path found).
- **Time**: O((V + E) log V) with a binary heap.
- **Limitation**: does not work with negative edge weights (use Bellman-Ford instead).

**Key concepts:** relaxation, greedy algorithm, min-heap, shortest path tree, negative weights
**Follow-up:** When would you use Bellman-Ford instead of Dijkstra's?

---

## Q: What is the two-pointer technique?

**Difficulty:** Intermediate | **Topic:** Algorithms

**Answer:**
The two-pointer technique uses two indices that traverse a data structure (usually from both ends or at different speeds) to solve problems efficiently. Reduces O(n²) brute force to O(n).
**Examples:**
- **Opposite ends**: finding a pair summing to target in a sorted array — left pointer at start, right at end; move based on comparison.
- **Fast/slow pointers**: cycle detection in a linked list (Floyd's algorithm).
- **Sliding window variant**: one pointer lags behind the other.

**Key concepts:** sorted arrays, in-place, cycle detection, Floyd's algorithm
**Follow-up:** How do you detect a cycle in a linked list using Floyd's algorithm?

---

## Q: What is memoization and how does it differ from tabulation?

**Difficulty:** Intermediate | **Topic:** Dynamic Programming

**Answer:**
Both are DP optimization techniques:
- **Memoization (top-down)**: add caching to a recursive function. Store results of subproblems in a dictionary/array. Only computes subproblems that are actually needed. Uses recursion (call stack overhead).
- **Tabulation (bottom-up)**: fill a DP table iteratively from base cases to the final answer. No recursion. Generally faster (no call stack). Computes all subproblems even if not needed.

**Key concepts:** recursive vs iterative, cache, subproblem DAG, space optimization
**Follow-up:** How can you optimize space in a tabulation DP solution for Fibonacci?

---

## Q: What is the difference between a tree and a graph?

**Difficulty:** Beginner | **Topic:** Data Structures

**Answer:**
- **Tree**: a connected acyclic undirected graph. Has exactly n-1 edges for n nodes. One root (in rooted trees). Every pair of nodes has exactly one path. Hierarchical structure.
- **Graph**: general structure. Can have cycles (cyclic), can be disconnected, directed or undirected. Trees are a special case of graphs.
Every tree is a graph, but not every graph is a tree. Trees have no cycles; graphs may.

**Key concepts:** acyclic, connected, rooted tree, hierarchy vs network

---

## Q: What is a balanced binary tree? Why does balance matter?

**Difficulty:** Intermediate | **Topic:** Trees

**Answer:**
A balanced binary tree is one where the height of the left and right subtrees of every node differ by at most a constant (typically 1, as in AVL trees). Height of a balanced tree is O(log n).
**Why it matters:** BST operations (search, insert, delete) are O(height). An unbalanced BST degenerates to O(n) in the worst case (like a linked list). Self-balancing trees (AVL, Red-Black) maintain O(log n) guarantees through rotations.

**Key concepts:** height, AVL tree, Red-Black tree, rotation, amortized complexity
