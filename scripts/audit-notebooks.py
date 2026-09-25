"""Check notebook structure and Python syntax without executing training/downloads.

IPython magics and shell commands are counted and skipped, not treated as Python.
Run: python scripts/audit-notebooks.py
"""
import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
paths = sorted({*ROOT.glob('notebook/**/*.ipynb'), *ROOT.glob('Regression/notebooks/*.ipynb'), *ROOT.glob('etl-pyspark/notebooks/*.ipynb')})
records = []
for path in paths:
    notebook = json.loads(path.read_text(encoding='utf-8'))
    record = {'file': path.relative_to(ROOT).as_posix(), 'cells': len(notebook['cells']), 'python_cells': 0, 'ipython_cells': 0, 'errors': [], 'execution': 'Not executed by this syntax audit'}
    for index, cell in enumerate(notebook['cells'], 1):
        if cell['cell_type'] != 'code':
            continue
        source = ''.join(cell['source'])
        if any(line.lstrip().startswith(('%', '!')) for line in source.splitlines()):
            record['ipython_cells'] += 1
            continue
        record['python_cells'] += 1
        try:
            ast.parse(source)
        except SyntaxError as error:
            record['errors'].append({'cell': index, 'line': error.lineno, 'message': error.msg})
    records.append(record)
out = ROOT / 'docs/audit/notebook-results.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'notebooks': len(records), 'python_cells': sum(r['python_cells'] for r in records), 'errors': [r for r in records if r['errors']]}, indent=2))
raise SystemExit(any(r['errors'] for r in records))
