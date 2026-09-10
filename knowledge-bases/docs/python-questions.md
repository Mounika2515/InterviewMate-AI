# Python Interview Questions

**Category:** Python Programming
**Target Roles:** Software Developer, AI/ML Engineer, Data Scientist, Data Analyst
**Difficulty Levels:** Beginner, Intermediate, Advanced

---

## Q: What is the difference between a list and a tuple in Python?

**Difficulty:** Beginner | **Topic:** Data Structures

**Answer:**
A list is mutable (can be changed after creation) and is defined with square brackets `[]`. A tuple is immutable (cannot be changed after creation) and is defined with parentheses `()`. Tuples are generally faster and use less memory than lists. Use tuples for fixed data and lists for data that needs to change.

**Key concepts:** mutability, memory efficiency, hashability
**Follow-up:** When would you use a tuple as a dictionary key?

---

## Q: What are list comprehensions and how do they differ from regular for loops?

**Difficulty:** Beginner | **Topic:** Syntax

**Answer:**
A list comprehension is a concise way to create lists in a single line. Syntax: `[expression for item in iterable if condition]`. They are more readable and slightly faster than equivalent for loops because they are optimized in CPython. Example: `squares = [x**2 for x in range(10)]` instead of building the list with append in a loop.

**Key concepts:** syntax, performance, readability
**Follow-up:** What is a generator expression and how does it differ from a list comprehension?

---

## Q: What is the difference between `==` and `is` in Python?

**Difficulty:** Beginner | **Topic:** Operators

**Answer:**
`==` compares the values of two objects (equality). `is` compares the identity — whether both variables point to the exact same object in memory. Example: `a = [1,2]; b = [1,2]; a == b` is `True` but `a is b` is `False`. Python caches small integers and interned strings, so `a = 256; b = 256; a is b` may be `True`, but this is an implementation detail, not guaranteed.

**Key concepts:** identity vs equality, object references, Python internals
**Follow-up:** Why is `is None` preferred over `== None`?

---

## Q: Explain Python's `*args` and `**kwargs`.

**Difficulty:** Beginner | **Topic:** Functions

**Answer:**
`*args` allows a function to accept any number of positional arguments as a tuple. `**kwargs` allows any number of keyword arguments as a dictionary. They let you write flexible functions. Example: `def func(*args, **kwargs): print(args, kwargs)`. You can call it as `func(1, 2, name="Alice")` — args becomes `(1, 2)` and kwargs becomes `{"name": "Alice"}`.

**Key concepts:** variadic arguments, packing/unpacking
**Follow-up:** In what order must `*args` and `**kwargs` appear in a function signature?

---

## Q: What is a decorator in Python?

**Difficulty:** Intermediate | **Topic:** Functions / Design Patterns

**Answer:**
A decorator is a function that takes another function as input, adds behavior to it, and returns the modified function. It uses the `@` syntax. Example: a logging decorator wraps any function to print its name and arguments before calling it. Decorators are used for logging, authentication, caching, and timing. They follow the "open/closed principle" — extending behavior without modifying the original function.

**Key concepts:** higher-order functions, closures, `functools.wraps`
**Follow-up:** What does `functools.wraps` do inside a decorator?

---

## Q: What is the difference between `deepcopy` and `copy` in Python?

**Difficulty:** Intermediate | **Topic:** Memory Management

**Answer:**
`copy.copy()` creates a shallow copy — the new object is a new container but it references the same inner objects. `copy.deepcopy()` creates a completely independent copy of an object and all objects nested within it recursively. Use shallow copy when inner objects do not need to be independent; use deep copy when you need full independence, such as copying a list of lists.

**Key concepts:** shallow vs deep copy, references, nested objects
**Follow-up:** What can go wrong if you use shallow copy with a list of mutable objects?

---

## Q: What are Python generators and when would you use them?

**Difficulty:** Intermediate | **Topic:** Iteration

**Answer:**
A generator is a function that uses `yield` instead of `return`, producing values one at a time and pausing execution between yields. Generators are memory-efficient because they don't store all values at once — they generate values on demand (lazy evaluation). Use them when processing large datasets, reading large files line by line, or implementing infinite sequences. Example: `def count_up(n): for i in range(n): yield i`.

**Key concepts:** `yield`, lazy evaluation, memory efficiency, `next()`
**Follow-up:** What is the difference between a generator function and a generator expression?

---

## Q: Explain Python's GIL (Global Interpreter Lock).

**Difficulty:** Intermediate | **Topic:** Concurrency

**Answer:**
The GIL is a mutex in CPython that ensures only one thread executes Python bytecode at a time, even on multi-core systems. It simplifies memory management but limits true multi-threaded parallelism for CPU-bound tasks. For CPU-bound work, use `multiprocessing` (separate processes, each with their own GIL) instead of `threading`. For I/O-bound work, `threading` and `asyncio` are still effective because threads release the GIL during I/O operations.

**Key concepts:** CPython, thread safety, multiprocessing vs threading, I/O-bound vs CPU-bound
**Follow-up:** How does `asyncio` avoid GIL limitations?

---

## Q: What is the difference between `@staticmethod`, `@classmethod`, and a regular instance method?

**Difficulty:** Intermediate | **Topic:** OOP

**Answer:**
- Instance method: takes `self` as first argument; has access to instance and class data.
- `@classmethod`: takes `cls` as first argument; has access to class-level data, not the instance. Used for factory methods or class-level operations.
- `@staticmethod`: takes no implicit first argument; no access to instance or class. Just a regular function namespaced inside the class.

**Key concepts:** OOP, method types, `cls` vs `self`
**Follow-up:** Give a practical use case for a `@classmethod`.

---

## Q: What is method resolution order (MRO) in Python?

**Difficulty:** Intermediate | **Topic:** OOP / Inheritance

**Answer:**
MRO determines the order in which Python looks up methods in a class hierarchy during inheritance. Python uses the C3 linearization algorithm. You can inspect it with `ClassName.__mro__` or `ClassName.mro()`. In multiple inheritance, Python traverses parent classes left to right, then upward, ensuring each class appears only once. `super()` follows MRO rather than calling a specific parent directly.

**Key concepts:** C3 linearization, multiple inheritance, `super()`
**Follow-up:** What problem does MRO solve in diamond inheritance?

---

## Q: Explain `__init__`, `__new__`, and `__call__` in Python classes.

**Difficulty:** Advanced | **Topic:** OOP / Dunder Methods

**Answer:**
- `__new__`: called before `__init__`; responsible for creating and returning the new instance. Rarely overridden except for singletons or immutable types.
- `__init__`: initializes the already-created instance; sets attributes. This is where you write setup code.
- `__call__`: makes an instance callable (like a function). Example: if class `Multiplier` defines `__call__(self, x)`, you can do `m = Multiplier(3); m(5)` returns 15.

**Key concepts:** instance creation lifecycle, metaclasses, callable objects
**Follow-up:** How would you implement a singleton using `__new__`?

---

## Q: What is a context manager and how do you implement one?

**Difficulty:** Intermediate | **Topic:** Resource Management

**Answer:**
A context manager defines setup and teardown logic using `__enter__` and `__exit__` methods, used with the `with` statement. It guarantees cleanup even if an exception occurs. Example: `with open("file.txt") as f:` automatically closes the file when the block exits. You can implement one with a class (defining `__enter__` and `__exit__`) or with `@contextlib.contextmanager` and a generator function using `yield`.

**Key concepts:** `with` statement, `__enter__`/`__exit__`, `contextlib`
**Follow-up:** How does `__exit__` suppress exceptions?

---

## Q: What is the difference between `range()` and `xrange()` in Python 3?

**Difficulty:** Beginner | **Topic:** Built-ins

**Answer:**
In Python 3, `xrange()` no longer exists. `range()` in Python 3 behaves like `xrange()` did in Python 2 — it is a lazy sequence object that generates numbers on demand rather than storing them all in memory. In Python 2, `range()` returned a full list while `xrange()` was the lazy version. In Python 3, iterating over `range(10**9)` uses constant memory.

**Key concepts:** Python 2 vs 3, lazy evaluation, memory efficiency

---

## Q: What are Python's built-in data structures? Compare their time complexities.

**Difficulty:** Intermediate | **Topic:** Data Structures

**Answer:**
- **List**: ordered, mutable. Append O(1) amortized, index O(1), search O(n), insert/delete at position O(n).
- **Dictionary**: unordered (insertion-ordered since Python 3.7), key-value. Get/set/delete O(1) average.
- **Set**: unordered, unique elements. Add/remove/membership O(1) average.
- **Tuple**: ordered, immutable. Index O(1), search O(n).
- **deque** (collections): O(1) append and pop from both ends.

**Key concepts:** time complexity, hash tables, underlying C implementations

---

## Q: What is `lambda` and when should it be avoided?

**Difficulty:** Beginner | **Topic:** Functions

**Answer:**
A `lambda` is an anonymous, single-expression function: `f = lambda x, y: x + y`. It's useful for short callbacks in `sorted()`, `map()`, `filter()`, and similar higher-order functions. Avoid lambdas for complex logic — use a named `def` function for readability. Avoid assigning a lambda to a variable name (PEP 8 recommends using `def` instead). Lambdas cannot contain statements (only expressions) and cannot have docstrings.

**Key concepts:** anonymous functions, PEP 8, readability

---

## Q: Explain Python's memory management and garbage collection.

**Difficulty:** Advanced | **Topic:** Internals

**Answer:**
Python uses reference counting as the primary memory management mechanism. When an object's reference count reaches zero, the memory is immediately freed. To handle circular references (which reference counting cannot catch), Python has a cyclic garbage collector that periodically checks for cycles. You can interact with it via the `gc` module. `sys.getrefcount()` returns the reference count of an object. CPython also uses memory pools (via pymalloc) for small objects.

**Key concepts:** reference counting, cyclic GC, `gc` module, memory pools

---

## Q: What is the difference between `map()`, `filter()`, and `reduce()`?

**Difficulty:** Beginner | **Topic:** Functional Programming

**Answer:**
- `map(func, iterable)`: applies `func` to every element, returns a lazy iterator of results.
- `filter(func, iterable)`: keeps only elements where `func(element)` is truthy, returns a lazy iterator.
- `reduce(func, iterable)`: (from `functools`) applies `func` cumulatively to collapse the sequence to a single value (e.g., sum all elements).

All return iterators (lazy) in Python 3. List comprehensions often replace `map` and `filter` for readability.

**Key concepts:** functional programming, lazy iterators, `functools`

---

## Q: What is `pickle` in Python and what are its security risks?

**Difficulty:** Intermediate | **Topic:** Serialization

**Answer:**
`pickle` serializes Python objects to a binary format and deserializes them back. It can serialize almost any Python object (including custom classes, functions, lambdas). Security risk: **never unpickle data from an untrusted source** — a malicious pickle can execute arbitrary code during deserialization. For safe data exchange, prefer JSON or other format-specific serializers. Use pickle only for internal, trusted data storage.

**Key concepts:** serialization, deserialization, security, `json` vs `pickle`

---

## Q: What is type hinting in Python and why is it used?

**Difficulty:** Beginner | **Topic:** Typing

**Answer:**
Type hints (PEP 484) allow you to annotate function signatures and variable types: `def add(a: int, b: int) -> int:`. They are not enforced at runtime by default but are used by static analysis tools (mypy, Pyright, IDEs) to catch type errors before running. They improve code readability and serve as inline documentation. The `typing` module provides `List`, `Dict`, `Optional`, `Union`, `Tuple`, etc. Python 3.10+ allows `X | Y` syntax instead of `Union[X, Y]`.

**Key concepts:** PEP 484, static analysis, mypy, runtime vs static

---

## Q: What is the difference between `__str__` and `__repr__`?

**Difficulty:** Beginner | **Topic:** OOP / Dunder Methods

**Answer:**
`__repr__` is the unambiguous developer representation of an object — ideally valid Python that could recreate the object. It is used in the REPL and by `repr()`. `__str__` is the human-readable string representation, used by `print()` and `str()`. If `__str__` is not defined, Python falls back to `__repr__`. Best practice: always define `__repr__` in custom classes; define `__str__` when users need a friendlier display.

**Key concepts:** dunder methods, developer vs user representation

---

## Q: What are Python's exception handling best practices?

**Difficulty:** Intermediate | **Topic:** Error Handling

**Answer:**
- Catch specific exceptions, not bare `except:` or `except Exception:` unless absolutely necessary.
- Use `else` clause for code that runs only if no exception occurred.
- Use `finally` for cleanup that must always run (e.g., closing files, releasing locks).
- Raise exceptions with context: `raise ValueError("message") from original_exc`.
- Create custom exceptions by subclassing `Exception`.
- Never silently swallow exceptions (empty `except` blocks).

**Key concepts:** `try`/`except`/`else`/`finally`, exception chaining, custom exceptions

---

## Q: What is the `collections` module? Name three useful classes from it.

**Difficulty:** Intermediate | **Topic:** Standard Library

**Answer:**
The `collections` module provides specialized container types:
- `defaultdict`: a dict that returns a default value for missing keys instead of raising `KeyError`. Example: `defaultdict(list)` for grouping.
- `Counter`: counts hashable objects. `Counter("hello")` returns `{"l":2, "h":1, "e":1, "o":1}`.
- `deque`: double-ended queue with O(1) append and pop from both ends. Ideal for sliding windows and BFS queues.
- `namedtuple`: creates tuples with named fields for readability without the overhead of a class.

**Key concepts:** specialized containers, performance, standard library

---

## Q: How does Python handle multiple inheritance? What is the diamond problem?

**Difficulty:** Advanced | **Topic:** OOP

**Answer:**
Python supports multiple inheritance: `class C(A, B):`. The diamond problem occurs when two parent classes share a common ancestor, creating ambiguity about which version of a method to use. Python solves this with the C3 MRO algorithm — it produces a consistent, predictable linearization. `super()` always delegates to the next class in the MRO, ensuring each class in the hierarchy is called exactly once in cooperative multiple inheritance.

**Key concepts:** C3 linearization, cooperative inheritance, `super()`

---

## Q: What are Python virtual environments and why are they important?

**Difficulty:** Beginner | **Topic:** Environment Management

**Answer:**
A virtual environment is an isolated Python installation with its own packages, separate from the system Python and other projects. Created with `python -m venv venv` or `uv venv`. Prevents package version conflicts between projects. Best practice: every project should have its own virtual environment. `requirements.txt` or `pyproject.toml` documents the project's dependencies for reproducibility.

**Key concepts:** isolation, dependency management, `venv`, `uv`, pip

---

## Q: What is the `asyncio` module and when would you use it?

**Difficulty:** Advanced | **Topic:** Concurrency

**Answer:**
`asyncio` is Python's standard library for writing concurrent code using an event loop, coroutines (`async def`), and `await`. It is ideal for I/O-bound tasks: web requests, database queries, file I/O — where you can do other work while waiting for a response. It is NOT suitable for CPU-bound tasks (use `multiprocessing` for those). Key concepts: `async def` defines a coroutine, `await` suspends execution, `asyncio.gather()` runs multiple coroutines concurrently.

**Key concepts:** event loop, coroutines, `async/await`, I/O-bound concurrency
