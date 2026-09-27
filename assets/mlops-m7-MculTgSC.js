import{u as r,j as e,B as s,Q as o,C as a}from"./index-DB2iY7np.js";import{P as d}from"./PredictReveal-Cw_QvC_A.js";function i(t){const n={a:"a",code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...r(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Module 7: Capstone: Training and Streaming Predictions"}),`
`,e.jsx(s,{children:e.jsx(n.p,{children:"Combine a finite training pipeline with a continuously operated event consumer. This capstone is a design and local simulation exercise; provisioning a production service is outside the lab."})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Learning outcome:"})," trace a model version from training to a persisted streaming prediction and describe recovery at each boundary."]}),`
`,e.jsx(n.h2,{children:"Draw the complete workflow"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-text",children:`Completed-trip snapshot
  → Airflow DAG on Composer
  → validate → features → train → evaluate
  → versioned candidate + report → approval → serving release
                                                   |
                                                   v
New trip events → Kafka OR Pub/Sub → prediction consumer → result store
                                        |
                                        v
                             latency, lag, errors, model version

Later completed-trip labels → join to predictions → quality monitoring
`})}),`
`,e.jsxs(n.p,{children:["Keep feature transformations consistent between training and inference. Pin the model version while processing an event, include that version in the stored result, and release preprocessing together with the model. A consumer should load a new approved artifact in a controlled rollout, rather than fetch an unversioned ",e.jsx(n.code,{children:"latest"})," object for every prediction."]}),`
`,e.jsx(n.h2,{children:"Choose the messaging path"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Decision"}),e.jsx(n.th,{children:"Kafka path"}),e.jsx(n.th,{children:"Pub/Sub path"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Independent applications"}),e.jsx(n.td,{children:"Separate consumer groups"}),e.jsx(n.td,{children:"Separate subscriptions"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Progress marker"}),e.jsx(n.td,{children:"Committed offset per partition"}),e.jsx(n.td,{children:"Message acknowledgment on a subscription"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Ordering"}),e.jsx(n.td,{children:"Within a partition"}),e.jsx(n.td,{children:"Per ordering key when configured"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Replay"}),e.jsx(n.td,{children:"Read retained records from an earlier position"}),e.jsx(n.td,{children:"Seek/snapshot and retention features, configured for the use case"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Application responsibility"}),e.jsx(n.td,{children:"Schema, inference, durable output, commit discipline"}),e.jsx(n.td,{children:"Schema, inference, durable output, acknowledgment discipline"})]})]})]}),`
`,e.jsx(n.p,{children:"Choose based on the surrounding platform, retention and replay needs, operational skills, and measured traffic. These concepts are related, but a Pub/Sub subscription is not a configurable Kafka partition. Neither choice removes the need for observability or duplicate-safe writes."}),`
`,e.jsx(n.h2,{children:"Build a local prediction sink"}),`
`,e.jsxs(n.p,{children:["This Python 3 program needs only the standard library. Save it as ",e.jsx(n.code,{children:"prediction_sink.py"})," and run ",e.jsx(n.code,{children:"python prediction_sink.py"}),". It simulates delivery after a crash using a SQLite file in the working directory. It is not a Kafka or Pub/Sub client."]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`from contextlib import closing
import sqlite3

MODEL_VERSION = "duration-teaching-v1"
events = [
    {"event_id": "start-1", "planned_km": 4},
    {"event_id": "start-2", "planned_km": 7},
    {"event_id": "start-1", "planned_km": 4},  # replay
]

with closing(sqlite3.connect("mlops_predictions_lab.sqlite")) as connection:
    connection.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            event_id TEXT NOT NULL,
            model_version TEXT NOT NULL,
            minutes REAL NOT NULL,
            PRIMARY KEY (event_id, model_version)
        )
    """)
    connection.commit()
    for event in events:
        # Illustrative fixed rule, not a fitted or evaluated model.
        minutes = 2.0 + 3.0 * event["planned_km"]
        with connection:
            connection.execute(
                "INSERT INTO predictions VALUES (?, ?, ?) "
                "ON CONFLICT(event_id, model_version) DO NOTHING",
                (event["event_id"], MODEL_VERSION, minutes),
            )
        # Kafka: commit the next offset AFTER this transaction.
        # Pub/Sub: acknowledge this delivery AFTER this transaction.
    rows = connection.execute(
        "SELECT event_id, minutes FROM predictions "
        "WHERE model_version = ? ORDER BY event_id", (MODEL_VERSION,)
    ).fetchall()
    print(rows)
`})}),`
`,e.jsxs(n.p,{children:["Expected output on a fresh lab database: ",e.jsx(n.code,{children:"[('start-1', 14.0), ('start-2', 23.0)]"}),". Run the program twice; the same two rows remain. The uniqueness constraint and insert belong to the database transaction, so a separate in-memory check is unnecessary."]}),`
`,e.jsx(n.p,{children:"The key allows one prediction per event and model version. If the business requires one prediction per event across all releases, use a different key and define how re-scoring works. A retry must preserve its assigned model version; do not silently switch models halfway through processing. Repeated event IDs with conflicting payloads require validation and investigation. SQLite here models a durable sink on one host, not a shared database for a fleet of consumers."}),`
`,e.jsx(n.h2,{children:"Measure operational and model behavior"}),`
`,e.jsx(n.p,{children:"Suppose 120 events arrive each second and one worker sustains 80 events per second. Backlog grows by 40 events per second, or 2,400 per minute, while those rates persist. Two such workers offer 160 events per second only if work can be parallelized and the sink keeps up; Kafka partition count can limit that parallelism."}),`
`,e.jsxs(n.p,{children:["Monitor input rate, consumer lag or oldest unacknowledged age, processing latency, error rate, invalid schemas, duplicate counts, and active model versions. Monitor feature freshness separately: fast inference on stale features can still be wrong. ",e.jsx(n.strong,{children:"Drift"})," means a distribution changed; it does not by itself prove accuracy worsened. Measure model error when actual trip durations arrive, matching each label to its prediction and model version."]}),`
`,e.jsx(d,{prompt:"The new model meets the validation gate but doubles production latency and the backlog grows. What is a reasonable response?",options:["Keep it because offline MAE improved","Investigate capacity and roll back to the last compatible release if service objectives are missed"],correct:1,children:e.jsx(n.p,{children:"Model quality and service reliability are separate release conditions. Keep the previous model, preprocessing, and schema compatibility available for rollback. Inspect arrival rate, partitioning, feature lookup, and sink latency before deciding whether scaling alone fixes the problem."})}),`
`,e.jsx(n.h2,{children:"Acceptance and recovery drills"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Reject a negative training duration before training; preserve the currently served model."}),`
`,e.jsx(n.li,{children:"Repeat a logical training interval with the same snapshot; identify every artifact and report by version."}),`
`,e.jsx(n.li,{children:"Deliver the same event twice; verify one intended result in durable storage."}),`
`,e.jsx(n.li,{children:"Stop a consumer after its write but before acknowledgment or commit; verify safe replay."}),`
`,e.jsx(n.li,{children:"Send an invalid schema; verify monitored quarantine rather than an endless retry loop."}),`
`,e.jsx(n.li,{children:"Deploy an incompatible candidate in a test environment; reject it or exercise rollback without losing pending events."}),`
`]}),`
`,e.jsx(n.p,{children:"Submit an architecture diagram, a release manifest, the local simulation output, and a short recovery plan. For a real integration, add a messaging client around the sink, configure authentication and retention, and test those failure boundaries with the actual services. Do not create one Airflow DAG run for every high-volume trip event; keep the scoring loop in a long-running consumer."}),`
`,e.jsx(o,{question:"Which record makes a delayed accuracy investigation possible?",options:["Only the most recent model filename","The event ID, prediction time, feature version, prediction, and model version","Only the number of successful DAG runs"],correct:1,explanation:"These fields let you join later labels to the exact prediction and release responsible for the outcome."}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsx(n.p,{children:"The complete system connects a versioned model release to a consumer that writes durable results before advancing delivery progress. Test recovery and observe both service behavior and delayed model quality."})}),`
`,e.jsx(n.h2,{children:"References"}),`
`,e.jsxs(n.p,{children:["The messaging comparison uses ",e.jsx(n.a,{href:"https://kafka.apache.org/design/",children:"Kafka's design documentation"}),", ",e.jsx(n.a,{href:"https://docs.cloud.google.com/pubsub/docs/subscriber",children:"Pub/Sub subscriptions"}),", and ",e.jsx(n.a,{href:"https://docs.cloud.google.com/pubsub/docs/replay-overview",children:"Pub/Sub replay"}),"."]})]})}function h(t={}){const{wrapper:n}={...r(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{h as default};
