import{u as i,j as e,B as r,Q as s,C as o}from"./index-DB2iY7np.js";import{P as l}from"./PredictReveal-Cw_QvC_A.js";function t(a){const n={a:"a",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",strong:"strong",...i(),...a.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 2: Building Pipelines with Apache Airflow"}),`
`,e.jsx(r,{children:e.jsx(n.p,{children:"The batch path needs an explicit order. Airflow represents that order as a directed acyclic graph (DAG): arrows describe dependencies and cannot form a loop."})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Learning outcome:"})," read and run a small TaskFlow pipeline with a validation step and a model-quality gate."]}),`
`,e.jsx(n.h2,{children:"Tasks, runs, and dependencies"}),`
`,e.jsxs(n.p,{children:["A ",e.jsx(n.strong,{children:"task"})," is one unit of work. A ",e.jsx(n.strong,{children:"DAG run"})," executes the workflow for one trigger or scheduled interval. A ",e.jsx(n.strong,{children:"task instance"})," is a particular task within a run. A worker executes task code; the scheduler arranges eligible work."]}),`
`,e.jsxs(n.p,{children:["Our dependency chain is ",e.jsx(n.code,{children:"extract → validate → train → evaluate → release_candidate"}),". Under the default success rule, a failed validation prevents downstream training. The release task receives an evaluation report, so it cannot run ahead of evaluation."]}),`
`,e.jsx(n.h2,{children:"Optional lab: a complete teaching DAG"}),`
`,e.jsxs(n.p,{children:["Use an isolated ",e.jsx(n.strong,{children:"Airflow 3"})," environment with a Python version supported by your selected Airflow release. On Windows, run Airflow through WSL2 or a Linux container. Follow the ",e.jsx(n.a,{href:"https://airflow.apache.org/docs/apache-airflow/stable/installation/index.html",children:"official installation instructions"}),", including the release's constraints file. Do not add Airflow to the website's JavaScript dependencies."]}),`
`,e.jsxs(n.p,{children:["Save the following as ",e.jsx(n.code,{children:"duration_training.py"})," in that environment's configured DAG folder. The tiny dataset travels through XCom, Airflow's task-message mechanism. This is suitable for this small lab; a real dataset belongs in shared storage."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from datetime import timedelta
import pendulum
from airflow.sdk import dag, task


@dag(
    dag_id="duration_training",
    schedule="@daily",
    start_date=pendulum.datetime(2026, 9, 1, tz="UTC"),
    catchup=False,
    max_active_runs=1,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=1)},
    tags=["mlops-learning"],
)
def duration_training():
    @task
    def extract():
        # Synthetic durations in minutes, already split for this lab.
        return {"train": [8, 10, 12], "validation": [9, 11]}

    @task
    def validate(data):
        for split in ("train", "validation"):
            if not data[split] or any(value <= 0 for value in data[split]):
                raise ValueError("Durations must be positive and nonempty")
        return data

    @task
    def train(data):
        return {"constant_minutes": sum(data["train"]) / len(data["train"])}

    @task
    def evaluate(model, data):
        prediction = model["constant_minutes"]
        mae = sum(abs(y - prediction) for y in data["validation"]) / len(data["validation"])
        return {"mae_minutes": mae, "candidate": model}

    @task
    def release_candidate(report):
        if report["mae_minutes"] > 2.0:
            raise ValueError("Candidate failed the teaching quality gate")
        # Demonstration only: no model registry or endpoint is changed.
        print({"eligible_for_review": True, **report})

    data = validate(extract())
    model = train(data)
    release_candidate(evaluate(model, data))


training_dag = duration_training()

if __name__ == "__main__":
    training_dag.test()
`})}),`
`,e.jsxs(n.p,{children:["The decorated function calls build dependencies when Airflow reads the file. Workers execute their bodies later. The final call creates the DAG object that Airflow discovers. Airflow 2 uses ",e.jsx(n.code,{children:"from airflow.decorators import dag, task"}),"; check the Composer image's Airflow version before adapting this example."]}),`
`,e.jsx(n.h2,{children:"Run and inspect"}),`
`,e.jsxs(n.p,{children:["In the configured Airflow environment, run ",e.jsx(n.code,{children:"python duration_training.py"})," for the local DAG test, or trigger ",e.jsx(n.code,{children:"duration_training"})," in the Airflow UI. A local test needs the environment's Airflow configuration and metadata database initialized. Inspect import errors if the DAG does not appear, then open task logs and the graph."]}),`
`,e.jsxs(n.p,{children:["Expected result: the model predicts 10 minutes, the absolute validation errors are 1 and 1, and MAE is 1.0. All five tasks succeed, and the release log contains ",e.jsx(n.code,{children:"eligible_for_review: True"}),". This is a constant baseline, not a useful production taxi model."]}),`
`,e.jsx(l,{prompt:"Change validation durations to [20, 22]. What happens to the candidate?",options:["It passes because training succeeded","MAE becomes 11 minutes and the release task fails"],correct:1,children:e.jsx(n.p,{children:"The prediction is still 10. The errors are 10 and 12, giving MAE 11. Training success says the computation ran; the quality gate separately judges the result. In this teaching DAG the default retries also apply to the failed gate. Production policy should distinguish transient failures from deterministic rejection."})}),`
`,e.jsx(s,{question:"Why does evaluate wait for both model and data?",options:["Its task arguments establish upstream dependencies","Its function name is special","Python runs every task body during DAG parsing"],correct:0,explanation:"TaskFlow uses references to upstream task outputs to connect the graph. These are runtime task outputs, not immediate values computed during parsing."}),`
`,e.jsx(o,{title:"TL;DR",children:e.jsx(n.p,{children:"A DAG makes dependencies explicit. Run a tiny known example first, inspect its logs, and separate successful execution from acceptable model quality."})}),`
`,e.jsx(n.h2,{children:"References"}),`
`,e.jsxs(n.p,{children:["API details: ",e.jsx(n.a,{href:"https://airflow.apache.org/docs/apache-airflow/stable/tutorial/taskflow.html",children:"TaskFlow tutorial"}),", ",e.jsx(n.a,{href:"https://airflow.apache.org/docs/apache-airflow/stable/concepts/dags.html",children:"DAG concepts and local testing"}),", and ",e.jsx(n.a,{href:"https://airflow.apache.org/docs/apache-airflow/stable/installation/index.html",children:"Airflow installation"}),"."]})]})}function h(a={}){const{wrapper:n}={...i(),...a.components};return n?e.jsx(n,{...a,children:e.jsx(t,{...a})}):t(a)}export{h as default};
