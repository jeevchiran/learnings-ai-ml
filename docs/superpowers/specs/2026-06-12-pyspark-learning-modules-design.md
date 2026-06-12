# PySpark Learning Modules — Design Spec

## Overview

A hybrid learning platform for PySpark/ETL concepts targeting an academic/student audience. Consists of 10 interactive HTML modules (single-page each) with companion Jupyter notebooks for full PySpark execution. Minimal design, no decoration.

## Delivery Format

- **HTML site**: 10 single-page HTML files with embedded Pyodide for live Python/Pandas execution, and simulated output for PySpark code blocks.
- **Companion notebooks**: 10 `.ipynb` files mirroring each module, fully executable with real PySpark (targeting Google Colab or local environments).
- **Shared assets**: One CSS file, one JS file (Pyodide loader + code block logic), shared dataset files.

## Module Sequence

All modules use a single running dataset (student enrollment/grades data) that grows in complexity:

| # | Module | Depends on | Dataset state |
|---|--------|------------|---------------|
| 1 | ETL with PySpark | — | Raw CSV files introduced |
| 2 | In-Memory Data Processing | 1 | Data loaded into memory, explain why |
| 3 | Spark RDDs | 2 | Same data as RDDs |
| 4 | DataFrames: PySpark vs Pandas | 3 | Same data, two APIs compared side-by-side |
| 5 | Querying with PySpark SQL | 4 | DataFrames registered as SQL temp views |
| 6 | UDFs in PySpark | 5 | Custom transformation logic on enrolled data |
| 7 | Data Cleaning | 6 | Messy/null version of dataset introduced |
| 8 | Data Exploration | 7 | Explore the cleaned dataset |
| 9 | Transformation Operations | 8 | Reshape, join, aggregate |
| 10 | Caching and Broadcast Variables | 9 | Optimize the full pipeline built across modules |

### Continuity Mechanism

- Each module opens with a "Where we left off" collapsible recap (2-3 sentences).
- Each module ends with a bridge sentence leading to the next topic.
- The dataset evolves naturally — raw in Module 1, cleaned by Module 7, optimized in Module 10.

## Page Architecture (per module)

Layout, top to bottom:

1. Module title + progress indicator ("Module 3 of 10")
2. "Where we left off" recap (collapsible)
3. Concept sections with explanatory text
4. Interactive code blocks (interspersed with text)
5. Concept checkpoints (single multiple-choice, self-check, not graded)
6. Practice problems section
7. "Next up" bridge

## Interactive Code Blocks

Two visually distinct types:

### Live blocks (Python/Pandas)
- Editable textarea
- "Run" button executes via Pyodide (in-browser Python/WASM)
- Output pane rendered below
- Green left-border indicator

### Simulated blocks (PySpark)
- Editable textarea (students can modify syntax to learn)
- "Run" button displays pre-computed output
- Label: "Simulated output — run in companion notebook for real execution"
- Blue left-border indicator

## Practice Problems

Each module ends with 3-4 problems, escalating difficulty:

### Structure per problem
- Problem statement (1-2 sentences)
- Starter code (pre-filled in interactive block)
- Collapsible "Hint" (one-liner nudge)
- Collapsible "Solution" (full code + 1-sentence explanation)

### Difficulty levels
1. **Recall** — reproduce taught concept with slight variation
2. **Apply** — combine two concepts from current module
3. **Stretch** — integrate current module with a previous one

## Design System

- Monochrome palette with one accent color for interactive elements
- No icons, no gradients, no decoration
- System font stack
- Generous whitespace
- Dark mode toggle (single button, top-right)
- Green left-border: live-runnable block
- Blue left-border: simulated PySpark block
- Collapsible panels for hints, solutions, recaps

## Tech Stack

- **HTML/CSS/JS**: Vanilla, no framework. One shared CSS file, one shared JS file.
- **Pyodide**: Loaded from CDN for live Python execution.
- **Syntax highlighting**: Prism.js or highlight.js (lightweight, no build step).
- **Notebooks**: Standard .ipynb format, compatible with Colab and JupyterLab.

## File Structure

```
learning/
  index.html              — landing page with module list
  modules/
    01-etl-pyspark.html
    02-in-memory-processing.html
    03-spark-rdds.html
    04-dataframes-pyspark-vs-pandas.html
    05-pyspark-sql.html
    06-udfs-pyspark.html
    07-data-cleaning.html
    08-data-exploration.html
    09-transformation-operations.html
    10-caching-broadcasting.html
  notebooks/
    01-etl-pyspark.ipynb
    02-in-memory-processing.ipynb
    03-spark-rdds.ipynb
    04-dataframes-pyspark-vs-pandas.ipynb
    05-pyspark-sql.ipynb
    06-udfs-pyspark.ipynb
    07-data-cleaning.ipynb
    08-data-exploration.ipynb
    09-transformation-operations.ipynb
    10-caching-broadcasting.ipynb
  assets/
    style.css
    main.js
    pyodide-loader.js
  data/
    students.csv
    enrollments.csv
    grades_messy.csv       — introduced in Module 7
  README.md               — setup instructions for notebooks
```

## Companion Notebooks

- One `.ipynb` per module, same code examples but all executable with real PySpark.
- Practice problems appear as empty cells with markdown instructions above.
- First notebook includes environment setup cell (pip install pyspark, SparkSession init).
- Each notebook starts with a "Run this cell first" block loading the shared dataset.
- Target environments: Google Colab (primary), local PySpark (secondary).

## Dataset

A synthetic student enrollment/grades dataset:

- `students.csv`: student_id, name, major, year, gpa
- `enrollments.csv`: enrollment_id, student_id, course_id, course_name, semester
- `grades_messy.csv`: Same as enriched enrollments but with nulls, duplicates, inconsistent formats (introduced in Module 7 for cleaning exercises)

Approximately 1000 rows each — small enough for in-browser Pandas, large enough to demonstrate Spark concepts meaningfully.

## Out of Scope

- No backend server
- No user authentication or progress persistence
- No grading or scoring system
- No video content
- No real PySpark execution in-browser (technically impossible without JVM)
