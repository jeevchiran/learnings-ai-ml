# PySpark Learning Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 10-module interactive PySpark learning platform with live Python/Pandas execution via Pyodide, simulated PySpark output, and companion Jupyter notebooks.

**Architecture:** Vanilla HTML/CSS/JS site with no build step. Each module is a standalone HTML page that loads shared assets (CSS, JS, Pyodide loader). Code blocks are rendered as editable textareas with Run buttons — live blocks execute via Pyodide, simulated blocks display pre-computed output. Companion .ipynb files mirror each module for real PySpark execution.

**Tech Stack:** HTML5, CSS3, vanilla JS, Pyodide (CDN), Prism.js (CDN), Jupyter Notebook format (.ipynb JSON)

---

## File Structure

```
learning/
  index.html
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
    grades_messy.csv
  README.md
```

---

## Task 1: Dataset Files

**Files:**
- Create: `data/students.csv`
- Create: `data/enrollments.csv`
- Create: `data/grades_messy.csv`

- [ ] **Step 1: Create students.csv**

Generate 50 rows (enough for meaningful examples, small enough for Pyodide). Columns: student_id, name, major, year, gpa.

```csv
student_id,name,major,year,gpa
1001,Alice Chen,Computer Science,3,3.8
1002,Bob Martinez,Data Science,2,3.5
1003,Carol Johnson,Mathematics,4,3.9
1004,David Kim,Computer Science,1,3.2
1005,Eva Patel,Data Science,3,3.7
1006,Frank Wilson,Statistics,2,3.4
1007,Grace Lee,Computer Science,4,3.6
1008,Henry Brown,Mathematics,1,2.9
1009,Iris Davis,Data Science,2,3.3
1010,Jack Thompson,Statistics,3,3.1
1011,Karen White,Computer Science,2,3.5
1012,Leo Garcia,Data Science,4,3.8
1013,Maria Rodriguez,Mathematics,1,3.0
1014,Nathan Park,Statistics,3,3.4
1015,Olivia Chang,Computer Science,2,3.7
1016,Peter Adams,Data Science,1,2.8
1017,Quinn Foster,Mathematics,3,3.6
1018,Rachel Kim,Statistics,4,3.9
1019,Sam Mitchell,Computer Science,1,3.1
1020,Tina Nguyen,Data Science,2,3.5
1021,Uma Sharma,Mathematics,3,3.3
1022,Victor Liu,Statistics,1,2.7
1023,Wendy Taylor,Computer Science,4,3.8
1024,Xavier Jones,Data Science,2,3.4
1025,Yuki Tanaka,Mathematics,1,3.2
1026,Zoe Williams,Statistics,3,3.6
1027,Aaron Scott,Computer Science,2,3.0
1028,Bella Rivera,Data Science,4,3.7
1029,Chris Morgan,Mathematics,1,2.9
1030,Diana Hall,Statistics,2,3.5
1031,Ethan Cooper,Computer Science,3,3.4
1032,Fiona Stewart,Data Science,1,3.1
1033,George Clark,Mathematics,4,3.8
1034,Hannah Lewis,Statistics,2,3.3
1035,Ivan Ross,Computer Science,1,2.8
1036,Julia Martin,Data Science,3,3.6
1037,Kyle Anderson,Mathematics,2,3.5
1038,Luna Perez,Statistics,4,3.9
1039,Mason Wright,Computer Science,1,3.0
1040,Nina Hernandez,Data Science,2,3.4
1041,Oscar Young,Mathematics,3,3.7
1042,Paula King,Statistics,1,2.6
1043,Ryan Phillips,Computer Science,4,3.8
1044,Sophie Turner,Data Science,2,3.5
1045,Thomas Campbell,Mathematics,1,3.1
1046,Ursula Baker,Statistics,3,3.4
1047,Vince Nelson,Computer Science,2,3.3
1048,Wanda Hill,Data Science,4,3.7
1049,Xander Moore,Mathematics,1,2.9
1050,Yasmin Reed,Statistics,2,3.5
```

- [ ] **Step 2: Create enrollments.csv**

Generate 100 rows linking students to courses. Columns: enrollment_id, student_id, course_id, course_name, semester, grade.

```csv
enrollment_id,student_id,course_id,course_name,semester,grade
E001,1001,CS101,Intro to Programming,Fall 2024,92
E002,1001,CS201,Data Structures,Fall 2024,88
E003,1002,DS101,Intro to Data Science,Fall 2024,85
E004,1002,DS201,Machine Learning,Spring 2025,79
E005,1003,MA101,Calculus I,Fall 2024,95
E006,1003,MA201,Linear Algebra,Spring 2025,91
E007,1004,CS101,Intro to Programming,Fall 2024,78
E008,1004,CS102,Discrete Math,Spring 2025,72
E009,1005,DS101,Intro to Data Science,Fall 2024,87
E010,1005,DS301,Big Data Analytics,Spring 2025,83
E011,1006,ST101,Intro to Statistics,Fall 2024,80
E012,1006,ST201,Probability Theory,Spring 2025,76
E013,1007,CS301,Algorithms,Fall 2024,89
E014,1007,CS401,Operating Systems,Spring 2025,84
E015,1008,MA101,Calculus I,Fall 2024,65
E016,1008,MA102,Calculus II,Spring 2025,62
E017,1009,DS101,Intro to Data Science,Fall 2024,81
E018,1009,DS202,Data Visualization,Spring 2025,77
E019,1010,ST201,Probability Theory,Fall 2024,74
E020,1010,ST301,Regression Analysis,Spring 2025,71
E021,1011,CS101,Intro to Programming,Fall 2024,86
E022,1011,CS201,Data Structures,Spring 2025,82
E023,1012,DS301,Big Data Analytics,Fall 2024,90
E024,1012,DS401,Deep Learning,Spring 2025,87
E025,1013,MA101,Calculus I,Fall 2024,70
E026,1013,MA102,Calculus II,Spring 2025,68
E027,1014,ST101,Intro to Statistics,Fall 2024,79
E028,1014,ST301,Regression Analysis,Spring 2025,75
E029,1015,CS201,Data Structures,Fall 2024,88
E030,1015,CS301,Algorithms,Spring 2025,85
E031,1016,DS101,Intro to Data Science,Fall 2024,63
E032,1016,DS102,Python for Data Science,Spring 2025,67
E033,1017,MA201,Linear Algebra,Fall 2024,84
E034,1017,MA301,Differential Equations,Spring 2025,80
E035,1018,ST301,Regression Analysis,Fall 2024,93
E036,1018,ST401,Bayesian Statistics,Spring 2025,91
E037,1019,CS101,Intro to Programming,Fall 2024,73
E038,1019,CS102,Discrete Math,Spring 2025,70
E039,1020,DS201,Machine Learning,Fall 2024,82
E040,1020,DS202,Data Visualization,Spring 2025,78
E041,1021,MA201,Linear Algebra,Fall 2024,77
E042,1021,MA301,Differential Equations,Spring 2025,74
E043,1022,ST101,Intro to Statistics,Fall 2024,60
E044,1022,ST102,Statistical Computing,Spring 2025,58
E045,1023,CS401,Operating Systems,Fall 2024,91
E046,1023,CS402,Computer Networks,Spring 2025,88
E047,1024,DS201,Machine Learning,Fall 2024,80
E048,1024,DS301,Big Data Analytics,Spring 2025,76
E049,1025,MA101,Calculus I,Fall 2024,75
E050,1025,MA102,Calculus II,Spring 2025,72
E051,1026,ST201,Probability Theory,Fall 2024,83
E052,1026,ST301,Regression Analysis,Spring 2025,80
E053,1027,CS101,Intro to Programming,Fall 2024,69
E054,1027,CS102,Discrete Math,Spring 2025,65
E055,1028,DS401,Deep Learning,Fall 2024,86
E056,1028,DS301,Big Data Analytics,Spring 2025,83
E057,1029,MA101,Calculus I,Fall 2024,64
E058,1029,MA102,Calculus II,Spring 2025,61
E059,1030,ST201,Probability Theory,Fall 2024,81
E060,1030,ST301,Regression Analysis,Spring 2025,78
E061,1031,CS201,Data Structures,Fall 2024,79
E062,1031,CS301,Algorithms,Spring 2025,76
E063,1032,DS101,Intro to Data Science,Fall 2024,72
E064,1032,DS102,Python for Data Science,Spring 2025,70
E065,1033,MA301,Differential Equations,Fall 2024,90
E066,1033,MA401,Abstract Algebra,Spring 2025,87
E067,1034,ST101,Intro to Statistics,Fall 2024,77
E068,1034,ST201,Probability Theory,Spring 2025,74
E069,1035,CS101,Intro to Programming,Fall 2024,62
E070,1035,CS102,Discrete Math,Spring 2025,59
E071,1036,DS201,Machine Learning,Fall 2024,84
E072,1036,DS301,Big Data Analytics,Spring 2025,81
E073,1037,MA201,Linear Algebra,Fall 2024,82
E074,1037,MA301,Differential Equations,Spring 2025,79
E075,1038,ST401,Bayesian Statistics,Fall 2024,94
E076,1038,ST301,Regression Analysis,Spring 2025,92
E077,1039,CS101,Intro to Programming,Fall 2024,68
E078,1039,CS201,Data Structures,Spring 2025,65
E079,1040,DS101,Intro to Data Science,Fall 2024,79
E080,1040,DS202,Data Visualization,Spring 2025,76
E081,1041,MA201,Linear Algebra,Fall 2024,86
E082,1041,MA301,Differential Equations,Spring 2025,83
E083,1042,ST101,Intro to Statistics,Fall 2024,57
E084,1042,ST102,Statistical Computing,Spring 2025,55
E085,1043,CS401,Operating Systems,Fall 2024,90
E086,1043,CS402,Computer Networks,Spring 2025,87
E087,1044,DS201,Machine Learning,Fall 2024,83
E088,1044,DS301,Big Data Analytics,Spring 2025,80
E089,1045,MA101,Calculus I,Fall 2024,73
E090,1045,MA102,Calculus II,Spring 2025,70
E091,1046,ST201,Probability Theory,Fall 2024,78
E092,1046,ST301,Regression Analysis,Spring 2025,75
E093,1047,CS201,Data Structures,Fall 2024,76
E094,1047,CS301,Algorithms,Spring 2025,73
E095,1048,DS401,Deep Learning,Fall 2024,85
E096,1048,DS301,Big Data Analytics,Spring 2025,82
E097,1049,MA101,Calculus I,Fall 2024,63
E098,1049,MA102,Calculus II,Spring 2025,60
E099,1050,ST201,Probability Theory,Fall 2024,80
E100,1050,ST301,Regression Analysis,Spring 2025,77
```

- [ ] **Step 3: Create grades_messy.csv**

Same structure as enrichments but with intentional quality issues: nulls, duplicates, inconsistent casing, extra whitespace, invalid grades.

```csv
enrollment_id,student_id,course_id,course_name,semester,grade
E001,1001,CS101,Intro to Programming,Fall 2024,92
E002,1001,CS201,Data Structures,Fall 2024,88
E003,1002,DS101,Intro to Data Science,Fall 2024,85
E003,1002,DS101,Intro to Data Science,Fall 2024,85
E004,1002,DS201,Machine Learning,Spring 2025,
E005,1003,MA101,calculus I,fall 2024,95
E006,1003,MA201,Linear Algebra,SPRING 2025,91
E007,1004,CS101,Intro to Programming,Fall 2024,78
E008,1004,CS102, Discrete Math ,Spring 2025,72
E009,,DS101,Intro to Data Science,Fall 2024,87
E010,1005,DS301,Big Data Analytics,Spring 2025,83
E011,1006,ST101,Intro to Statistics,Fall 2024,180
E012,1006,ST201,Probability Theory,Spring 2025,76
E013,1007,CS301,Algorithms,Fall 2024,89
E013,1007,CS301,Algorithms,Fall 2024,89
E014,1007,CS401,Operating Systems,Spring 2025,84
E015,1008,MA101,Calculus I,Fall 2024,65
E016,1008,MA102,Calculus II,Spring 2025,-5
E017,1009,DS101,intro to data science,Fall 2024,81
E018,1009,DS202,Data Visualization,Spring 2025,
E019,1010,ST201,Probability Theory,Fall 2024,74
E020,1010,ST301,Regression Analysis,spring 2025,71
E021,1011,CS101,Intro to Programming,Fall 2024,86
E022,,CS201,Data Structures,Spring 2025,82
E023,1012,DS301,Big Data Analytics,Fall 2024,90
E024,1012,DS401,Deep Learning,Spring 2025,87
E025,1013,MA101,Calculus I,Fall 2024,70
E026,1013,MA102, calculus II ,Spring 2025,68
E027,1014,ST101,Intro to Statistics,Fall 2024,79
E028,1014,ST301,Regression Analysis,Spring 2025,
E029,1015,CS201,Data Structures,Fall 2024,88
E030,1015,CS301,Algorithms,Spring 2025,85
E030,1015,CS301,Algorithms,Spring 2025,85
E031,1016,DS101,Intro to Data Science,Fall 2024,63
E032,1016,DS102,Python for Data Science,Spring 2025,67
E033,1017,MA201,Linear Algebra,Fall 2024,84
E034,1017,MA301,Differential Equations,Spring 2025,999
E035,1018,ST301,Regression Analysis,Fall 2024,93
E036,1018,ST401,Bayesian Statistics,Spring 2025,91
E037,1019,CS101, Intro to Programming ,Fall 2024,73
E038,1019,CS102,Discrete Math,Spring 2025,70
E039,,DS201,Machine Learning,Fall 2024,82
E040,1020,DS202,Data Visualization,Spring 2025,78
```

- [ ] **Step 4: Commit**

```bash
git init
git add data/
git commit -m "feat: add synthetic dataset files (students, enrollments, grades_messy)"
```

---

## Task 2: CSS Design System

**Files:**
- Create: `assets/style.css`

- [ ] **Step 1: Write the complete stylesheet**

Implements: monochrome palette, system font stack, generous whitespace, dark mode toggle, green/blue left-border code blocks, collapsible panels, progress indicator, responsive layout.

```css
:root {
  --bg: #ffffff;
  --bg-secondary: #f8f9fa;
  --text: #1a1a1a;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --accent: #374151;
  --live-border: #16a34a;
  --simulated-border: #2563eb;
  --code-bg: #f3f4f6;
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Fira Mono", Menlo, monospace;
  --max-width: 780px;
  --spacing: 2rem;
}

[data-theme="dark"] {
  --bg: #111827;
  --bg-secondary: #1f2937;
  --text: #f3f4f6;
  --text-muted: #9ca3af;
  --border: #374151;
  --accent: #d1d5db;
  --code-bg: #1f2937;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font);
  color: var(--text);
  background: var(--bg);
  line-height: 1.7;
  padding: var(--spacing);
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.progress {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-family: var(--font);
}

h1 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

p {
  margin-bottom: 1rem;
}

/* Collapsible panels */
details {
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  padding: 0.75rem 1rem;
}

details summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.9rem;
}

details[open] summary {
  margin-bottom: 0.75rem;
}

/* Code blocks */
.code-block {
  margin: 1.5rem 0;
  border: 1px solid var(--border);
  border-radius: 2px;
}

.code-block.live {
  border-left: 3px solid var(--live-border);
}

.code-block.simulated {
  border-left: 3px solid var(--simulated-border);
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.code-block textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  background: var(--code-bg);
  color: var(--text);
  border: none;
  resize: vertical;
  line-height: 1.5;
  tab-size: 4;
}

.code-block textarea:focus {
  outline: none;
}

.run-btn {
  background: var(--accent);
  color: var(--bg);
  border: none;
  padding: 0.3rem 0.8rem;
  font-size: 0.75rem;
  cursor: pointer;
  font-family: var(--font);
}

.run-btn:hover {
  opacity: 0.8;
}

.code-output {
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  white-space: pre-wrap;
  color: var(--text);
  display: none;
}

.code-output.visible {
  display: block;
}

.simulated-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 0.3rem 1rem;
  background: var(--bg-secondary);
}

/* Practice problems */
.practice-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.problem {
  margin-bottom: 2rem;
}

.problem-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.difficulty {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

/* Checkpoint (multiple choice) */
.checkpoint {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}

.checkpoint-question {
  font-weight: 500;
  margin-bottom: 1rem;
}

.checkpoint label {
  display: block;
  padding: 0.4rem 0;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkpoint .feedback {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  display: none;
}

.checkpoint .feedback.visible {
  display: block;
}

/* Navigation */
.module-nav {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
}

.module-nav a {
  color: var(--text);
  text-decoration: none;
  font-size: 0.9rem;
}

.module-nav a:hover {
  text-decoration: underline;
}

/* Index page */
.module-list {
  list-style: none;
}

.module-list li {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}

.module-list a {
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
}

.module-list a:hover {
  text-decoration: underline;
}

.module-list .module-desc {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

/* Tabs (for PySpark vs Pandas comparison) */
.tabs {
  margin: 1.5rem 0;
}

.tab-buttons {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1.2rem;
  font-family: var(--font);
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/style.css
git commit -m "feat: add minimal design system stylesheet"
```

---

## Task 3: Pyodide Loader

**Files:**
- Create: `assets/pyodide-loader.js`

- [ ] **Step 1: Write Pyodide loader**

Handles lazy-loading Pyodide on first Run click, caching the instance, and providing a `runPython(code)` function.

```javascript
let pyodideInstance = null;
let pyodideLoading = false;
let pyodideLoadCallbacks = [];

async function loadPyodideInstance() {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading) {
    return new Promise((resolve) => {
      pyodideLoadCallbacks.push(resolve);
    });
  }
  pyodideLoading = true;

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
  document.head.appendChild(script);

  await new Promise((resolve) => {
    script.onload = resolve;
  });

  pyodideInstance = await loadPyodide();
  await pyodideInstance.loadPackage(["pandas"]);

  pyodideLoading = false;
  pyodideLoadCallbacks.forEach((cb) => cb(pyodideInstance));
  pyodideLoadCallbacks = [];

  return pyodideInstance;
}

async function runPython(code) {
  const pyodide = await loadPyodideInstance();

  pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
  `);

  try {
    pyodide.runPython(code);
    const stdout = pyodide.runPython("sys.stdout.getvalue()");
    const stderr = pyodide.runPython("sys.stderr.getvalue()");
    return { output: stdout + stderr, error: false };
  } catch (e) {
    return { output: e.message, error: true };
  }
}

window.runPython = runPython;
```

- [ ] **Step 2: Commit**

```bash
git add assets/pyodide-loader.js
git commit -m "feat: add Pyodide lazy-loader for live Python execution"
```

---

## Task 4: Main JavaScript (Code Block Logic)

**Files:**
- Create: `assets/main.js`

- [ ] **Step 1: Write main.js**

Handles: Run button clicks (live vs simulated), dark mode toggle, collapsible panels, tabs, checkpoints.

```javascript
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initCodeBlocks();
  initCheckpoints();
  initTabs();
});

function initThemeToggle() {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

function initCodeBlocks() {
  document.querySelectorAll(".code-block").forEach((block) => {
    const btn = block.querySelector(".run-btn");
    const textarea = block.querySelector("textarea");
    const output = block.querySelector(".code-output");
    if (!btn || !textarea || !output) return;

    btn.addEventListener("click", async () => {
      const code = textarea.value;

      if (block.classList.contains("live")) {
        btn.textContent = "Running...";
        btn.disabled = true;
        const result = await window.runPython(code);
        output.textContent = result.output || "(no output)";
        output.classList.add("visible");
        btn.textContent = "Run";
        btn.disabled = false;
      } else if (block.classList.contains("simulated")) {
        const precomputed = block.getAttribute("data-output");
        output.textContent = precomputed || "(no simulated output)";
        output.classList.add("visible");
      }
    });
  });
}

function initCheckpoints() {
  document.querySelectorAll(".checkpoint").forEach((cp) => {
    const inputs = cp.querySelectorAll('input[type="radio"]');
    const feedback = cp.querySelector(".feedback");
    if (!inputs.length || !feedback) return;

    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        const correct = cp.getAttribute("data-correct");
        if (input.value === correct) {
          feedback.textContent = "Correct.";
        } else {
          feedback.textContent = "Not quite. Try again.";
        }
        feedback.classList.add("visible");
      });
    });
  });
}

function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabGroup) => {
    const buttons = tabGroup.querySelectorAll(".tab-btn");
    const contents = tabGroup.querySelectorAll(".tab-content");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        contents.forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const target = tabGroup.querySelector(
          `.tab-content[data-tab="${btn.getAttribute("data-tab")}"]`
        );
        if (target) target.classList.add("active");
      });
    });
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/main.js
git commit -m "feat: add main.js with code block execution, theme toggle, tabs"
```

---

## Task 5: Index Page

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write index.html**

Landing page listing all 10 modules with brief descriptions.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PySpark Learning Modules</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>PySpark Learning Modules</h1>
      <button class="theme-toggle">Dark mode</button>
    </header>

    <p>A hands-on course covering PySpark and ETL fundamentals. Each module builds on the previous one using a shared student enrollment dataset.</p>

    <ul class="module-list">
      <li>
        <a href="modules/01-etl-pyspark.html">Module 1: ETL with PySpark</a>
        <div class="module-desc">Extract, transform, and load data using PySpark pipelines.</div>
      </li>
      <li>
        <a href="modules/02-in-memory-processing.html">Module 2: In-Memory Data Processing</a>
        <div class="module-desc">Understand why Spark keeps data in memory and how it differs from disk-based processing.</div>
      </li>
      <li>
        <a href="modules/03-spark-rdds.html">Module 3: Spark RDDs</a>
        <div class="module-desc">Work with Resilient Distributed Datasets — Spark's foundational abstraction.</div>
      </li>
      <li>
        <a href="modules/04-dataframes-pyspark-vs-pandas.html">Module 4: DataFrames — PySpark vs Pandas</a>
        <div class="module-desc">Compare the same operations in both APIs side-by-side.</div>
      </li>
      <li>
        <a href="modules/05-pyspark-sql.html">Module 5: Querying with PySpark SQL</a>
        <div class="module-desc">Register DataFrames as tables and query them with SQL syntax.</div>
      </li>
      <li>
        <a href="modules/06-udfs-pyspark.html">Module 6: UDFs in PySpark</a>
        <div class="module-desc">Write and apply User-Defined Functions for custom transformations.</div>
      </li>
      <li>
        <a href="modules/07-data-cleaning.html">Module 7: Data Cleaning</a>
        <div class="module-desc">Handle nulls, duplicates, inconsistent formats, and invalid values.</div>
      </li>
      <li>
        <a href="modules/08-data-exploration.html">Module 8: Data Exploration</a>
        <div class="module-desc">Summarize, profile, and understand your cleaned dataset.</div>
      </li>
      <li>
        <a href="modules/09-transformation-operations.html">Module 9: Transformation Operations</a>
        <div class="module-desc">Reshape, join, aggregate, and pivot data for analysis.</div>
      </li>
      <li>
        <a href="modules/10-caching-broadcasting.html">Module 10: Caching and Broadcast Variables</a>
        <div class="module-desc">Optimize your Spark pipeline with caching strategies and broadcast joins.</div>
      </li>
    </ul>
  </div>
  <script src="assets/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add index landing page with module list"
```

---

## Task 6: Module 1 — ETL with PySpark

**Files:**
- Create: `modules/01-etl-pyspark.html`

- [ ] **Step 1: Write the complete module HTML**

This is the template-setting module — all subsequent modules follow this structure. Contains: header with progress, concept sections on Extract/Transform/Load, simulated PySpark code blocks showing CSV reading and basic transforms, a live Pandas block for comparison, concept checkpoint, 3 practice problems, and bridge to Module 2.

The HTML structure for each code block:

```html
<!-- Simulated PySpark block -->
<div class="code-block simulated" data-output="+-----------+---------------+-----+----+---+
|student_id |name           |major|year|gpa|
+-----------+---------------+-----+----+---+
|1001       |Alice Chen     |CS   |3   |3.8|
|1002       |Bob Martinez   |DS   |2   |3.5|
+-----------+---------------+-----+----+---+
only showing top 2 rows">
  <div class="code-block-header">
    <span>PySpark (simulated)</span>
    <button class="run-btn">Run</button>
  </div>
  <textarea>from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("ETL").getOrCreate()

# Extract: read CSV
students_df = spark.read.csv("data/students.csv", header=True, inferSchema=True)
students_df.show(2)</textarea>
  <div class="code-output"></div>
  <div class="simulated-label">Simulated output — run in companion notebook for real execution</div>
</div>

<!-- Live Python/Pandas block -->
<div class="code-block live">
  <div class="code-block-header">
    <span>Python/Pandas (live)</span>
    <button class="run-btn">Run</button>
  </div>
  <textarea>import pandas as pd

# The same Extract step in Pandas
students_df = pd.read_csv("data/students.csv")
print(students_df.head(2))</textarea>
  <div class="code-output"></div>
</div>
```

Full module content covers:
- What is ETL (Extract, Transform, Load)
- Extract: reading CSV with `spark.read.csv()`
- Transform: selecting columns, renaming, filtering
- Load: writing results with `df.write.parquet()`
- Practice problems:
  1. (Recall) Read enrollments.csv and display the first 5 rows
  2. (Apply) Read students.csv, filter to GPA > 3.5, select name and major columns
  3. (Stretch) Read both CSVs and count the rows in each

- [ ] **Step 2: Commit**

```bash
git add modules/01-etl-pyspark.html
git commit -m "feat: add Module 1 — ETL with PySpark"
```

---

## Task 7: Module 2 — In-Memory Data Processing

**Files:**
- Create: `modules/02-in-memory-processing.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- "Where we left off" recap (Module 1 loaded CSV data with ETL)
- Why in-memory: disk I/O vs RAM speed, MapReduce limitations
- Spark's DAG execution model (lazy evaluation)
- Memory partitioning concept
- Simulated code blocks showing: `df.persist()`, `df.cache()`, `df.storageLevel`
- Live Pandas block: timing comparison of repeated operations on in-memory data
- Checkpoint: "Why does Spark delay execution until an action is called?"
- Practice problems:
  1. (Recall) Explain what happens when you call `.cache()` on a DataFrame
  2. (Apply) Show the sequence: read CSV, filter, cache, then trigger with `.count()`
  3. (Stretch) Compare timing of `.count()` before and after `.cache()` using the students data
- Bridge to Module 3: "Now that we understand why data lives in memory, let's look at the lowest-level abstraction Spark uses to represent it: RDDs."

- [ ] **Step 2: Commit**

```bash
git add modules/02-in-memory-processing.html
git commit -m "feat: add Module 2 — In-Memory Data Processing"
```

---

## Task 8: Module 3 — Spark RDDs

**Files:**
- Create: `modules/03-spark-rdds.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: data lives in memory across a cluster
- What is an RDD: immutable, distributed, fault-tolerant
- Creating RDDs: `sc.parallelize()`, `sc.textFile()`
- Transformations vs Actions: `map`, `filter`, `flatMap` vs `collect`, `count`, `reduce`
- Simulated blocks: parallelize student list, map to extract majors, filter by GPA, reduce to compute average
- Live block: Python list comprehensions as analogy (map/filter on plain lists)
- Checkpoint: "Which of these is a transformation, not an action? (a) collect (b) filter (c) count"
- Practice problems:
  1. (Recall) Create an RDD from a list of tuples and use `.count()`
  2. (Apply) Use `map` and `filter` to get names of students with GPA > 3.5
  3. (Stretch) Use `reduceByKey` to compute average GPA per major
- Bridge to Module 4: "RDDs are powerful but low-level. Spark introduced DataFrames to give you a higher-level API with optimizations built in."

- [ ] **Step 2: Commit**

```bash
git add modules/03-spark-rdds.html
git commit -m "feat: add Module 3 — Spark RDDs"
```

---

## Task 9: Module 4 — DataFrames: PySpark vs Pandas

**Files:**
- Create: `modules/04-dataframes-pyspark-vs-pandas.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: RDDs work but lack schema awareness and optimization
- PySpark DataFrame vs Pandas DataFrame: same concept, different execution
- Key differences table: lazy vs eager, distributed vs single-machine, immutable vs mutable
- **Tabbed code blocks** (uses `.tabs` component) comparing:
  - Reading CSV (PySpark tab / Pandas tab)
  - Selecting columns
  - Filtering rows
  - Adding computed columns
  - Grouping and aggregation
- Each tabbed pair has the PySpark version as simulated, Pandas as live
- Checkpoint: "When would you choose PySpark over Pandas? (a) Dataset fits in RAM on one machine (b) Dataset is 500GB across a cluster (c) You need interactive plotting"
- Practice problems:
  1. (Recall) Write both PySpark and Pandas code to select student name and GPA where year == 3
  2. (Apply) In both APIs, group by major and compute mean GPA
  3. (Stretch) Add a column `gpa_category` ("high" if GPA > 3.5, else "standard") in both
  4. (Stretch) Using Pandas live block, load students.csv and compute the same aggregation from problem 2

- [ ] **Step 2: Commit**

```bash
git add modules/04-dataframes-pyspark-vs-pandas.html
git commit -m "feat: add Module 4 — DataFrames PySpark vs Pandas"
```

---

## Task 10: Module 5 — Querying with PySpark SQL

**Files:**
- Create: `modules/05-pyspark-sql.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: DataFrames give schema-aware operations
- Registering DataFrames as temp views: `df.createOrReplaceTempView("students")`
- Writing SQL queries: `spark.sql("SELECT ...")`
- Joins in SQL vs DataFrame API
- Subqueries and CTEs
- Simulated blocks: register students and enrollments as views, join them, aggregate
- Live block: same queries with `pandasql` library (or just raw Pandas as comparison)
- Checkpoint: "What does `createOrReplaceTempView` do? (a) Saves data to disk (b) Registers the DataFrame as a queryable SQL table in the Spark session (c) Creates a persistent database table"
- Practice problems:
  1. (Recall) Register enrollments as a temp view and SELECT all rows WHERE grade > 85
  2. (Apply) JOIN students and enrollments on student_id, SELECT name, course_name, grade
  3. (Stretch) Write a CTE that computes average grade per student, then SELECT students with avg > 80
- Bridge to Module 6: "SQL and DataFrame operations cover most needs. But sometimes you need custom logic that doesn't exist as a built-in function — that's where UDFs come in."

- [ ] **Step 2: Commit**

```bash
git add modules/05-pyspark-sql.html
git commit -m "feat: add Module 5 — Querying with PySpark SQL"
```

---

## Task 11: Module 6 — UDFs in PySpark

**Files:**
- Create: `modules/06-udfs-pyspark.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: SQL and DataFrame API for standard operations
- When to use UDFs: custom business logic not expressible with built-ins
- Creating UDFs: `@udf` decorator, `udf()` function registration
- Return types and type safety
- Performance implications (serialization cost, no Catalyst optimization)
- Pandas UDFs (vectorized) as faster alternative
- Simulated blocks: classify GPA into letter grades, normalize semester strings, compute weighted scores
- Live block: equivalent Python functions on Pandas (to show the logic works)
- Checkpoint: "Why are Pandas UDFs faster than regular UDFs? (a) They use less memory (b) They process data in batches using Arrow serialization (c) They run on the driver only"
- Practice problems:
  1. (Recall) Write a UDF that converts numeric grade to letter grade (A/B/C/D/F)
  2. (Apply) Register a UDF for SQL use and apply it in a SELECT statement
  3. (Stretch) Write a Pandas UDF that normalizes GPA to a 0-100 scale and apply it to the students DataFrame
- Bridge to Module 7: "Now we can transform data any way we want. But real data is messy — before any meaningful analysis, we need to clean it."

- [ ] **Step 2: Commit**

```bash
git add modules/06-udfs-pyspark.html
git commit -m "feat: add Module 6 — UDFs in PySpark"
```

---

## Task 12: Module 7 — Data Cleaning

**Files:**
- Create: `modules/07-data-cleaning.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: UDFs let us apply custom logic; now we apply it to messy data
- Introducing `grades_messy.csv` — show the problems (nulls, duplicates, bad values)
- Handling nulls: `dropna()`, `fillna()`, `isNull()`
- Removing duplicates: `dropDuplicates()`
- Fixing inconsistent casing: `lower()`, `trim()`, `initcap()`
- Validating ranges: filter out grades < 0 or > 100
- Simulated blocks: step-by-step cleaning pipeline on grades_messy
- Live block: same cleaning in Pandas (read grades_messy.csv, fix each issue)
- Checkpoint: "Which approach is best for rows with null student_id? (a) Fill with 0 (b) Drop the rows (c) Fill with the mean student_id"
- Practice problems:
  1. (Recall) Load grades_messy.csv and count nulls per column
  2. (Apply) Remove duplicates and rows with invalid grades (outside 0-100)
  3. (Stretch) Build a full cleaning pipeline: trim whitespace, normalize casing, drop nulls in student_id, remove duplicates, filter invalid grades
  4. (Stretch) Compare row count before and after each cleaning step
- Bridge to Module 8: "With clean data in hand, we can now explore it to understand patterns and distributions."

- [ ] **Step 2: Commit**

```bash
git add modules/07-data-cleaning.html
git commit -m "feat: add Module 7 — Data Cleaning"
```

---

## Task 13: Module 8 — Data Exploration

**Files:**
- Create: `modules/08-data-exploration.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: data is clean; now we explore to understand it
- Descriptive statistics: `describe()`, `summary()`
- Value counts and distributions: `groupBy().count()`
- Schema inspection: `printSchema()`, `dtypes`
- Sampling: `sample()`, `take()`
- Cross-tabulation: `crosstab()`
- Simulated blocks: describe students, count per major, grade distribution, crosstab major vs year
- Live block: Pandas `describe()`, `value_counts()`, basic text-based histogram
- Checkpoint: "What does `df.describe()` NOT show? (a) Mean (b) Standard deviation (c) Median (d) Count"
- Practice problems:
  1. (Recall) Run `describe()` on the enrollments DataFrame and interpret the output
  2. (Apply) Find the top 3 courses by enrollment count
  3. (Stretch) Create a cross-tabulation of major vs year showing student count in each cell
- Bridge to Module 9: "Exploration reveals what we have. Transformation operations let us reshape it into what we need."

- [ ] **Step 2: Commit**

```bash
git add modules/08-data-exploration.html
git commit -m "feat: add Module 8 — Data Exploration"
```

---

## Task 14: Module 9 — Transformation Operations

**Files:**
- Create: `modules/09-transformation-operations.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: we explored the data; now we reshape for analysis
- Joins: inner, left, right, full outer, anti — with students and enrollments
- Aggregation: `groupBy().agg()`, multiple aggregate functions
- Pivoting: `pivot()` for reshaping long to wide
- Window functions: `row_number()`, `rank()`, `lag()`, `lead()` over partitions
- Union and vertical concatenation
- Simulated blocks: join students+enrollments, pivot grades by semester, window function for rank within major
- Live block: Pandas merge, pivot_table, rank
- Checkpoint: "Which join type returns only rows that exist in BOTH DataFrames? (a) left (b) inner (c) full outer"
- Practice problems:
  1. (Recall) Perform an inner join between students and enrollments on student_id
  2. (Apply) Group by major, compute average grade and student count using `.agg()`
  3. (Stretch) Use a window function to rank students within each major by GPA (highest first)
  4. (Stretch) Pivot the enrollments data to show average grade per student per semester
- Bridge to Module 10: "We can now transform data any way we need. The final piece is making these transformations fast — through caching and broadcast variables."

- [ ] **Step 2: Commit**

```bash
git add modules/09-transformation-operations.html
git commit -m "feat: add Module 9 — Transformation Operations"
```

---

## Task 15: Module 10 — Caching and Broadcast Variables

**Files:**
- Create: `modules/10-caching-broadcasting.html`

- [ ] **Step 1: Write the complete module HTML**

Content:
- Recap: we can build complex pipelines; now we optimize them
- When to cache: reused DataFrames, iterative algorithms
- Storage levels: MEMORY_ONLY, MEMORY_AND_DISK, DISK_ONLY
- `cache()` vs `persist()` — default vs explicit level
- Unpersisting: `unpersist()` to free memory
- Broadcast variables: small lookup tables shared to all workers
- `broadcast()` for join optimization (small table broadcast to avoid shuffle)
- Accumulator variables (brief mention)
- Simulated blocks: cache students after cleaning, persist with MEMORY_AND_DISK, broadcast a course lookup table for enrichment join
- Live block: demonstrate memoization concept in plain Python as analogy
- Checkpoint: "When should you NOT cache a DataFrame? (a) It's used once then discarded (b) It's used in 5 subsequent operations (c) It's the result of an expensive join"
- Practice problems:
  1. (Recall) Cache the students DataFrame and run `.count()` twice — explain what happens differently
  2. (Apply) Create a small lookup dictionary, broadcast it, and use it in a UDF to enrich enrollments
  3. (Stretch) Build a pipeline that reads students, joins with enrollments, cleans, caches the result, then runs three different aggregations on the cached data
  4. (Stretch) Choose appropriate storage levels for: (a) a DataFrame used 10 times that fits in memory, (b) a large DataFrame used 3 times that doesn't fit in memory
- No "Next up" bridge — this is the final module. Instead: "You've built a complete PySpark pipeline from raw CSV to optimized, cached results. The companion notebooks let you run everything on real Spark infrastructure."

- [ ] **Step 2: Commit**

```bash
git add modules/10-caching-broadcasting.html
git commit -m "feat: add Module 10 — Caching and Broadcast Variables"
```

---

## Task 16: Companion Notebooks (all 10)

**Files:**
- Create: `notebooks/01-etl-pyspark.ipynb`
- Create: `notebooks/02-in-memory-processing.ipynb`
- Create: `notebooks/03-spark-rdds.ipynb`
- Create: `notebooks/04-dataframes-pyspark-vs-pandas.ipynb`
- Create: `notebooks/05-pyspark-sql.ipynb`
- Create: `notebooks/06-udfs-pyspark.ipynb`
- Create: `notebooks/07-data-cleaning.ipynb`
- Create: `notebooks/08-data-exploration.ipynb`
- Create: `notebooks/09-transformation-operations.ipynb`
- Create: `notebooks/10-caching-broadcasting.ipynb`

- [ ] **Step 1: Write notebook 01 (ETL) as the template**

Each .ipynb is a JSON file with this structure. Notebook 01 establishes the pattern:

```json
{
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {},
      "source": ["# Module 1: ETL with PySpark\n", "\n", "Run this notebook in Google Colab or a local PySpark environment."]
    },
    {
      "cell_type": "code",
      "metadata": {},
      "source": ["# Run this cell first — environment setup\n", "!pip install -q pyspark\n", "\n", "from pyspark.sql import SparkSession\n", "spark = SparkSession.builder.appName('LearningModules').getOrCreate()"],
      "outputs": [],
      "execution_count": null
    },
    {
      "cell_type": "code",
      "metadata": {},
      "source": ["# Load dataset\n", "students_df = spark.read.csv('data/students.csv', header=True, inferSchema=True)\n", "students_df.show(5)"],
      "outputs": [],
      "execution_count": null
    }
  ],
  "metadata": {
    "kernelspec": { "display_name": "Python 3", "language": "python", "name": "python3" },
    "language_info": { "name": "python", "version": "3.10.0" }
  },
  "nbformat": 4,
  "nbformat_minor": 5
}
```

Each notebook includes:
- Setup cell (pip install pyspark, create SparkSession)
- Data loading cell
- Code cells mirroring each concept section from the HTML module
- Practice problem cells: markdown instruction cell followed by empty code cell with `# Your code here` comment
- Hint cells (markdown, collapsed in Colab with `<details>` tags)

- [ ] **Step 2: Write remaining notebooks 02-10**

Each follows the same pattern as 01, with content matching its HTML module. Key differences per notebook:
- Notebook 07+ loads `grades_messy.csv` in addition to the clean files
- Notebook 04 includes both PySpark and Pandas cells side-by-side
- Notebook 10 demonstrates actual timing differences with `time.time()`

- [ ] **Step 3: Commit**

```bash
git add notebooks/
git commit -m "feat: add companion Jupyter notebooks for all 10 modules"
```

---

## Task 17: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

```markdown
# PySpark Learning Modules

10 interactive modules covering PySpark and ETL fundamentals for students.

## Using the HTML Modules

Open `index.html` in a browser. No build step or server required.

- Green-bordered code blocks run live (Python/Pandas via Pyodide)
- Blue-bordered code blocks show simulated PySpark output

## Using the Companion Notebooks

The `notebooks/` directory contains Jupyter notebooks with executable PySpark code.

### Google Colab (recommended)

1. Upload the notebook to Google Colab
2. Upload the `data/` folder to your Colab session
3. Run the first cell to install PySpark

### Local Environment

1. Install Python 3.8+ and Java 8+
2. `pip install pyspark jupyter`
3. `jupyter notebook` from this directory
4. Open any notebook in `notebooks/`

## Dataset

- `data/students.csv` — 50 student records
- `data/enrollments.csv` — 100 course enrollment records
- `data/grades_messy.csv` — dirty version for cleaning exercises (Module 7+)

## Module Sequence

1. ETL with PySpark
2. In-Memory Data Processing
3. Spark RDDs
4. DataFrames: PySpark vs Pandas
5. Querying with PySpark SQL
6. UDFs in PySpark
7. Data Cleaning
8. Data Exploration
9. Transformation Operations
10. Caching and Broadcast Variables
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "feat: add README with setup instructions"
```

---

## Task 18: Verify and Test

- [ ] **Step 1: Open index.html in browser**

Run a local server and verify:
```bash
python -m http.server 8000
```

- [ ] **Step 2: Test checklist**

- Index page loads, all module links work
- Module 1 loads, code blocks render correctly
- Dark mode toggle works
- Live Pandas block executes (first run loads Pyodide ~10s, subsequent runs instant)
- Simulated PySpark block shows pre-computed output on Run
- Collapsible Hint/Solution panels work
- Checkpoint radio buttons show feedback
- Tabs work in Module 4
- Navigation links between modules work
- All 10 modules load without console errors

- [ ] **Step 3: Test a notebook**

Open notebook 01 in Jupyter/Colab and verify cells execute with PySpark.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during testing"
```
