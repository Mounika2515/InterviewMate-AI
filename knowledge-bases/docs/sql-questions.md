# SQL Interview Questions

**Category:** SQL and Databases
**Target Roles:** Data Scientist, Data Analyst, Software Developer
**Difficulty Levels:** Beginner, Intermediate, Advanced

---

## Q: What is the difference between `WHERE` and `HAVING` in SQL?

**Difficulty:** Beginner | **Topic:** Filtering

**Answer:**
- `WHERE` filters rows **before** aggregation. It cannot reference aggregate functions (SUM, COUNT, AVG).
- `HAVING` filters groups **after** aggregation. It is used with `GROUP BY` to filter based on aggregate values.
- Example: `SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;` — this returns only departments with more than 5 employees.

**Key concepts:** aggregation, GROUP BY, filtering order
**Follow-up:** Can you use column aliases in a `HAVING` clause?

---

## Q: What are the different types of SQL JOINs?

**Difficulty:** Beginner | **Topic:** Joins

**Answer:**
- **INNER JOIN**: returns rows where there is a match in both tables.
- **LEFT JOIN (LEFT OUTER JOIN)**: returns all rows from the left table, and matched rows from the right. Unmatched right rows are NULL.
- **RIGHT JOIN (RIGHT OUTER JOIN)**: all rows from right, matched from left.
- **FULL OUTER JOIN**: all rows from both tables; unmatched rows from either side are NULL.
- **CROSS JOIN**: Cartesian product — every row from table A with every row from table B.
- **SELF JOIN**: joins a table with itself using aliases.

**Key concepts:** matching conditions, NULL handling, Cartesian product
**Follow-up:** How would you find rows in table A that have no match in table B?

---

## Q: What is a subquery? What is the difference between a correlated and non-correlated subquery?

**Difficulty:** Intermediate | **Topic:** Subqueries

**Answer:**
A subquery is a query nested inside another query.
- **Non-correlated subquery**: independent of the outer query; executes once and its result is used by the outer query. Example: `SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);`
- **Correlated subquery**: references a column from the outer query; executes once per row of the outer query. Slower but more powerful. Example: finding employees who earn more than the average for their department.

**Key concepts:** nested queries, execution plan, performance
**Follow-up:** How can a correlated subquery often be rewritten as a JOIN for better performance?

---

## Q: What is a window function? Give an example.

**Difficulty:** Intermediate | **Topic:** Advanced SQL

**Answer:**
A window function performs a calculation across a set of rows related to the current row (the "window"), without collapsing them like GROUP BY. Syntax: `function OVER (PARTITION BY ... ORDER BY ...)`.
- `ROW_NUMBER()`: assigns a unique sequential number within a partition.
- `RANK()`: assigns rank with gaps for ties.
- `DENSE_RANK()`: rank without gaps.
- `LAG(col, n)` / `LEAD(col, n)`: access previous/next row's value.
- `SUM() OVER (...)`: running sum.
- Example: `SELECT name, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank FROM employees;`

**Key concepts:** OVER, PARTITION BY, ORDER BY, frame clause
**Follow-up:** What is the difference between RANK() and DENSE_RANK()?

---

## Q: What is normalization in databases? Explain 1NF, 2NF, and 3NF.

**Difficulty:** Intermediate | **Topic:** Database Design

**Answer:**
Normalization organizes a database to reduce redundancy and improve data integrity.
- **1NF (First Normal Form)**: every column contains atomic (indivisible) values; no repeating groups or arrays in a cell.
- **2NF (Second Normal Form)**: meets 1NF AND every non-key column is fully functionally dependent on the entire primary key (no partial dependencies — relevant only for composite keys).
- **3NF (Third Normal Form)**: meets 2NF AND no transitive dependencies — non-key columns must depend only on the primary key, not on other non-key columns.

**Key concepts:** functional dependency, redundancy, data integrity, denormalization tradeoffs
**Follow-up:** When would you intentionally denormalize a database?

---

## Q: What is the difference between `DELETE`, `TRUNCATE`, and `DROP`?

**Difficulty:** Beginner | **Topic:** DDL/DML

**Answer:**
- `DELETE`: DML — removes specific rows (with optional `WHERE`). Can be rolled back. Triggers fire. Slower because it logs each row deletion.
- `TRUNCATE`: DDL — removes all rows from a table. Cannot use `WHERE`. Faster (minimal logging). In most databases, cannot be rolled back (auto-commit). Resets identity/auto-increment.
- `DROP`: DDL — removes the entire table structure and all its data permanently.

**Key concepts:** DDL vs DML, transactions, rollback, performance
**Follow-up:** Does `TRUNCATE` fire triggers?

---

## Q: What is an index in SQL? What are the tradeoffs?

**Difficulty:** Beginner | **Topic:** Performance

**Answer:**
An index is a data structure (typically a B-tree) that speeds up data retrieval by allowing the database to find rows without scanning the entire table. Tradeoffs:
- **Benefits**: faster SELECT queries on indexed columns, faster ORDER BY and JOIN on indexed columns.
- **Costs**: slower INSERT, UPDATE, DELETE (the index must be updated); extra storage space.
- **Types**: clustered index (defines physical row order; one per table), non-clustered index (separate structure with pointers), composite index (multiple columns), unique index, full-text index.

**Key concepts:** B-tree, query planner, selectivity, covering index
**Follow-up:** When should you NOT add an index?

---

## Q: What is a CTE (Common Table Expression)?

**Difficulty:** Intermediate | **Topic:** Advanced SQL

**Answer:**
A CTE is a named temporary result set defined with `WITH ... AS (...)` that can be referenced within a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs improve readability for complex queries. Recursive CTEs use `WITH RECURSIVE` to process hierarchical data (trees, org charts, bill of materials). Unlike subqueries, CTEs can be referenced multiple times in the same query.

**Example:**
```sql
WITH dept_avg AS (
  SELECT department, AVG(salary) AS avg_sal
  FROM employees GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e JOIN dept_avg d ON e.department = d.department;
```

**Key concepts:** readability, recursive CTE, temporary scope, reuse
**Follow-up:** What is the difference between a CTE and a temp table?

---

## Q: What is the difference between `UNION` and `UNION ALL`?

**Difficulty:** Beginner | **Topic:** Set Operations

**Answer:**
Both combine the results of two SELECT queries (same number and compatible column types).
- `UNION`: removes duplicate rows (performs a distinct operation). Slower because it must sort/compare.
- `UNION ALL`: keeps all rows including duplicates. Faster because no deduplication.
Use `UNION ALL` by default for performance when you know there are no duplicates or duplicates are acceptable.

**Key concepts:** set operations, deduplication, performance
**Follow-up:** What is the difference between UNION and INTERSECT?

---

## Q: What is a stored procedure? How is it different from a function?

**Difficulty:** Intermediate | **Topic:** Database Programming

**Answer:**
- **Stored procedure**: a precompiled group of SQL statements stored in the database. Can perform DML and DDL, accept IN/OUT parameters, does not need to return a value. Called with `EXEC` or `CALL`.
- **Function** (UDF): must return a value. Can be used inside SELECT statements. Usually cannot perform DML (implementation-dependent). Simpler and more reusable in queries.
- Stored procedures are better for complex business logic; functions are better for computations used in queries.

**Key concepts:** precompilation, DML/DDL, IN/OUT parameters, reusability

---

## Q: What is a transaction? Explain ACID properties.

**Difficulty:** Intermediate | **Topic:** Database Fundamentals

**Answer:**
A transaction is a unit of work that is completed entirely or not at all.
- **Atomicity**: all operations in a transaction succeed or all are rolled back.
- **Consistency**: a transaction brings the database from one valid state to another, respecting all constraints.
- **Isolation**: concurrent transactions appear to execute serially; changes are not visible to other transactions until committed.
- **Durability**: committed transactions persist even in the event of a system failure.

**Key concepts:** COMMIT, ROLLBACK, isolation levels, concurrency control
**Follow-up:** What are the different SQL isolation levels?

---

## Q: What is the difference between `GROUP BY` and `PARTITION BY`?

**Difficulty:** Intermediate | **Topic:** Aggregation

**Answer:**
- `GROUP BY`: collapses rows into summary rows. The query returns one row per group. Used with aggregate functions (COUNT, SUM, AVG). You lose the detail rows.
- `PARTITION BY`: used in window functions (`OVER`). Divides rows into groups for calculation purposes but **does not collapse** rows — the original rows are still returned with the window calculation as an additional column.

**Key concepts:** window functions, aggregation, row visibility
**Follow-up:** Can you use both GROUP BY and window functions in the same query?

---

## Q: How do you find duplicate records in a SQL table?

**Difficulty:** Intermediate | **Topic:** Data Quality

**Answer:**
```sql
-- Find duplicates on specific column(s)
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Show all duplicate rows
SELECT * FROM users
WHERE email IN (
  SELECT email FROM users
  GROUP BY email HAVING COUNT(*) > 1
);
```
To delete duplicates while keeping one row: use ROW_NUMBER() window function to number duplicates, then delete where row_number > 1.

**Key concepts:** HAVING, COUNT, ROW_NUMBER, deduplication

---

## Q: What is the difference between a primary key and a unique key?

**Difficulty:** Beginner | **Topic:** Constraints

**Answer:**
- **Primary key**: uniquely identifies each row. Cannot be NULL. Only one per table. Creates a clustered index (in most databases).
- **Unique key**: ensures all values in a column (or combination) are distinct. Can have one NULL (in most databases). Multiple unique keys allowed per table.
Both enforce uniqueness, but the primary key is the main row identifier and cannot be NULL.

**Key concepts:** NULL, clustered vs non-clustered index, entity integrity

---

## Q: What is a view in SQL? What are its advantages and limitations?

**Difficulty:** Intermediate | **Topic:** Database Objects

**Answer:**
A view is a named virtual table defined by a SELECT query. It does not store data itself but presents a saved query result.
**Advantages**: simplifies complex queries, provides an abstraction layer, improves security (expose only certain columns), promotes reusability.
**Limitations**: some databases don't allow INSERT/UPDATE/DELETE through views (especially views with JOINs or aggregations); no inherent performance benefit (the underlying query runs each time unless it is a materialized view).

**Key concepts:** virtual table, abstraction, security, materialized view
**Follow-up:** What is a materialized view?

---

## Q: Explain the SQL execution order.

**Difficulty:** Intermediate | **Topic:** Query Processing

**Answer:**
SQL queries are **written** in this order: SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.
But they are **executed** in this order:
1. FROM / JOINs (determine data source)
2. WHERE (filter rows before grouping)
3. GROUP BY (aggregate)
4. HAVING (filter groups)
5. SELECT (compute expressions, aliases)
6. DISTINCT (remove duplicates)
7. ORDER BY (sort — aliases available here)
8. LIMIT/OFFSET (pagination)

This is why you cannot use a SELECT alias in a WHERE clause but can use it in ORDER BY.

**Key concepts:** logical vs physical processing, alias availability, query optimization

---

## Q: What is a self-join and when would you use it?

**Difficulty:** Intermediate | **Topic:** Joins

**Answer:**
A self-join joins a table to itself using aliases. Used for hierarchical data or comparing rows within the same table.
**Example** — Find all employees and their managers (both stored in the same `employees` table):
```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
```
Also useful: finding employees with the same job title, comparing consecutive records, finding pairs that satisfy a condition.

**Key concepts:** aliases, recursive/hierarchical data, row comparison

---

## Q: What are SQL aggregate functions? List the most common ones.

**Difficulty:** Beginner | **Topic:** Aggregation

**Answer:**
Aggregate functions compute a single result from a set of rows:
- `COUNT(*)`: count all rows; `COUNT(col)` counts non-NULL values.
- `SUM(col)`: sum of values (ignores NULLs).
- `AVG(col)`: average (ignores NULLs).
- `MIN(col)` / `MAX(col)`: minimum/maximum value.
- `GROUP_CONCAT()` / `STRING_AGG()`: concatenate strings across rows.
All aggregate functions ignore NULL values except `COUNT(*)`.

**Key concepts:** NULL handling, GROUP BY, HAVING

---

## Q: What is the difference between `INNER JOIN` and a `WHERE` clause with multiple tables (implicit join)?

**Difficulty:** Intermediate | **Topic:** Joins

**Answer:**
Old-style implicit join: `SELECT * FROM a, b WHERE a.id = b.a_id;`
Explicit INNER JOIN: `SELECT * FROM a INNER JOIN b ON a.id = b.a_id;`
Both produce the same result, but explicit JOIN syntax is preferred because:
- More readable, especially with multiple joins.
- Makes accidental Cartesian products impossible (you must specify the ON condition).
- `OUTER JOIN`s cannot be expressed with the implicit syntax in standard SQL.

**Key concepts:** SQL standards, readability, Cartesian product prevention

---

## Q: Write a SQL query to find the second-highest salary.

**Difficulty:** Intermediate | **Topic:** Query Writing

**Answer:**
Multiple approaches:
```sql
-- Using subquery
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Using LIMIT/OFFSET
SELECT salary FROM employees
ORDER BY salary DESC LIMIT 1 OFFSET 1;

-- Using DENSE_RANK
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) ranked WHERE rnk = 2;
```
The DENSE_RANK approach is most generalizable for nth-highest salary.

**Key concepts:** subquery, window functions, LIMIT/OFFSET, ranking

---

## Q: What is the difference between `IN` and `EXISTS`?

**Difficulty:** Intermediate | **Topic:** Subqueries

**Answer:**
- `IN`: evaluates the subquery once, materializes the result set, then checks membership. Better for small subquery result sets.
- `EXISTS`: returns true as soon as one matching row is found (short-circuits). Better for large subquery result sets or when the subquery involves an index.
- `EXISTS` is generally preferred for correlated subqueries because it stops at the first match, while `IN` must compute the full set.
- `IN` with NULL: `NULL IN (1,2,NULL)` returns NULL (not TRUE), which can cause unexpected no-results.

**Key concepts:** short-circuit evaluation, NULL behavior, performance, correlated subquery
