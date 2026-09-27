import{u as r,j as e,B as t,Q as i,C as a}from"./index-DB2iY7np.js";import{P as c}from"./PredictReveal-Cw_QvC_A.js";function s(o){const n={a:"a",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",strong:"strong",...r(),...o.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 4: Google Cloud Composer"}),`
`,e.jsx(t,{children:e.jsx(n.p,{children:"The DAG still describes the workflow when you move to Google Cloud. Composer supplies the managed Airflow environment in which it runs."})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Learning outcome:"})," explain a Composer deployment and trace a DAG from source file to task execution."]}),`
`,e.jsx(n.h2,{children:"What is managed, and what you own"}),`
`,e.jsx(n.p,{children:"Google Cloud Composer manages an Airflow environment. You still own the DAG code, Python dependencies, input contracts, access permissions, external jobs, and failure response. A managed scheduler cannot decide whether a model's features or evaluation are correct."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-text",children:`Versioned DAG source
        |
        v
Environment bucket: dags/ --> Airflow parses DAG --> scheduled run
                                                    |
                                                    v
                                              task workers
                                                    |
                                                    v
                                  data storage / training job / artifacts
`})}),`
`,e.jsx(n.p,{children:"The environment's Cloud Storage bucket carries DAG files. Task data and model artifacts should use deliberately selected storage locations; the DAG folder is not a model registry."}),`
`,e.jsx(n.h2,{children:"Compatibility before deployment"}),`
`,e.jsxs(n.p,{children:["Composer generation and Airflow major version are different version numbers. In particular, do not infer the available Python imports merely from the name ",e.jsx(n.strong,{children:"Composer 3"}),". Inspect your environment's image, Airflow version, Python version, and installed provider packages. Match the DAG from Module 2 to that runtime and test dependencies before upgrading."]}),`
`,e.jsxs(n.p,{children:["An ",e.jsx(n.strong,{children:"Airflow provider"})," is a package containing integrations such as Google Cloud operators and hooks. A hook wraps a service connection; an operator defines an Airflow task. Their APIs follow the installed provider version. Keep a tested dependency specification with the DAG source."]}),`
`,e.jsx(n.h2,{children:"Optional lab: deploy to an existing environment"}),`
`,e.jsx(n.p,{children:"This lab requires a Google Cloud project, an existing Composer environment, the Google Cloud CLI, and permission to upload DAGs and view the environment. Composer and jobs can incur charges while provisioned or running. The commands below deploy only the tiny teaching DAG; they do not create a Composer environment or release a real model."}),`
`,e.jsxs(n.p,{children:["Replace ",e.jsx(n.code,{children:"YOUR_PROJECT"}),", ",e.jsx(n.code,{children:"YOUR_REGION"}),", and ",e.jsx(n.code,{children:"YOUR_ENVIRONMENT"}),". Run these commands from the directory containing the version-compatible ",e.jsx(n.code,{children:"duration_training.py"})," file:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`gcloud composer environments describe YOUR_ENVIRONMENT \\
  --project YOUR_PROJECT --location YOUR_REGION \\
  --format="yaml(config.softwareConfig,config.dagGcsPrefix)"

gcloud composer environments storage dags import \\
  --project YOUR_PROJECT --environment YOUR_ENVIRONMENT \\
  --location YOUR_REGION --source duration_training.py
`})}),`
`,e.jsx(n.p,{children:"Open the environment's Airflow UI. Allow time for DAG synchronization and parsing, check import errors, and trigger one run. Expected result: the same five tasks and MAE of 1.0 from Module 2. If parsing fails, compare imports and dependencies with the environment runtime before retrying the upload. If execution fails, inspect that task's logs and the external service error."}),`
`,e.jsx(n.p,{children:"After the exercise, pause the teaching DAG and remove its file from the environment's DAG storage if no longer needed. Pausing a DAG does not stop the cost of the Composer environment. Remove a dedicated training environment only when its owner confirms no other workflows depend on it."}),`
`,e.jsx(n.h2,{children:"Identity and secrets"}),`
`,e.jsx(n.p,{children:"The identity uploading the DAG and the service account executing tasks can have different permissions. A successful upload therefore does not prove that a task can read a dataset or submit a training job."}),`
`,e.jsx(n.p,{children:"Grant task identities only the needed access to specific data, artifacts, and services. Use managed connections or an appropriately configured secrets backend for credentials, rather than embedding keys in source. Verify networking as well as permissions: a worker with access rights still needs a route to the service."}),`
`,e.jsx(c,{prompt:"The DAG imports successfully, but its first storage read returns permission denied. What should you inspect?",options:["The task runtime identity and its access to the target resource","Only the upload user's permissions"],correct:0,children:e.jsx(n.p,{children:"DAG deployment and task execution are separate operations. Check the effective runtime identity, the target bucket or object, and the required permission in the failing call. Avoid fixing a narrow read failure with broad project-wide admin access."})}),`
`,e.jsx(i,{question:"Does deploying a DAG to Composer automatically deploy its resulting model to a prediction service?",options:["Yes, every successful DAG publishes a model","No, model publication and rollout must be implemented as explicit workflow steps"],correct:1,explanation:"Composer runs the tasks you define. The teaching release task only prints a result; it does not change any serving endpoint."}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsx(n.p,{children:"Composer hosts Airflow. Match the actual runtime, deploy a tested DAG, and diagnose parsing, task permissions, and external job failures separately."})}),`
`,e.jsx(n.h2,{children:"References"}),`
`,e.jsxs(n.p,{children:["Consult ",e.jsx(n.a,{href:"https://docs.cloud.google.com/composer/docs/composer-3/manage-dags",children:"Composer DAG deployment"}),", ",e.jsx(n.a,{href:"https://docs.cloud.google.com/composer/docs/composer-versions",children:"Composer version selection"}),", and ",e.jsx(n.a,{href:"https://docs.cloud.google.com/composer/docs/composer-3/access-control",children:"Composer access control"}),"."]})]})}function h(o={}){const{wrapper:n}={...r(),...o.components};return n?e.jsx(n,{...o,children:e.jsx(s,{...o})}):s(o)}export{h as default};
