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
