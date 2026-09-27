import{u as i,j as e,B as o,Q as r,C as a}from"./index-DB2iY7np.js";import{P as c}from"./PredictReveal-Cw_QvC_A.js";function t(n){const s={a:"a",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",strong:"strong",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{children:"Module 6: Google Cloud Pub/Sub"}),`
`,e.jsx(o,{children:e.jsx(s.p,{children:"Pub/Sub is another way to connect event producers and consumers. You manage topics and subscriptions instead of assigning your application explicit Kafka partition offsets."})}),`
`,e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Learning outcome:"})," publish a message, receive it through a subscription, and choose when to acknowledge it."]}),`
`,e.jsx(s.h2,{children:"Topic, subscription, subscriber"}),`
`,e.jsxs(s.p,{children:["A publisher sends messages to a ",e.jsx(s.strong,{children:"topic"}),". A ",e.jsx(s.strong,{children:"subscription"})," tracks delivery to a consuming application. Subscribers sharing a subscription share its delivery workload; independent subscriptions can each receive messages published to the topic. Create the subscriptions before publishing in this lab."]}),`
`,e.jsxs(s.p,{children:["A ",e.jsx(s.strong,{children:"pull"})," subscriber requests messages, often using a streaming-pull client library for sustained traffic. A ",e.jsx(s.strong,{children:"push"})," subscription delivers to an HTTP endpoint. In either model, acknowledgment tells Pub/Sub that the delivery has been handled. Your application still owns validation, inference, and output persistence."]}),`
`,e.jsxs(s.p,{children:["By default, plan for at-least-once delivery and no ordering guarantee. An ",e.jsx(s.strong,{children:"acknowledgment deadline"})," limits how long a delivery can remain unacknowledged before it becomes eligible for redelivery. Supported client libraries can extend leases while work continues. Flow control limits in-flight messages and bytes so slow inference does not exhaust memory."]}),`
`,e.jsx(s.h2,{children:"Optional lab: publish, pull, acknowledge"}),`
`,e.jsxs(s.p,{children:["Use Google Cloud Shell (Bash), or a Bash shell with an authenticated Google Cloud CLI. Select a project with the Pub/Sub API enabled and permission to create, publish to, consume from, and delete these lab resources. This exercise creates cloud resources and may incur usage charges. Replace ",e.jsx(s.code,{children:"YOUR_PROJECT"}),"; use names that do not collide with existing resources."]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-bash",children:`gcloud pubsub topics create mlops-trips-lab --project YOUR_PROJECT

gcloud pubsub subscriptions create mlops-predictions-lab \\
  --project YOUR_PROJECT --topic mlops-trips-lab --ack-deadline=60

gcloud pubsub topics publish mlops-trips-lab --project YOUR_PROJECT \\
  --message='{"event_id":"start-1","trip_id":"trip-1","schema_version":1,"planned_km":4}'

gcloud pubsub subscriptions pull mlops-predictions-lab \\
  --project YOUR_PROJECT --limit=1 --format=json
`})}),`
`,e.jsxs(s.p,{children:["The publish command returns a service message ID. Pull returns the message and a delivery-specific ",e.jsx(s.code,{children:"ackId"}),"; JSON output represents the data payload in base64. Pull again if an initial request returns no messages. For this inspection-only exercise, decoding and inspecting the message completes the intended work. Copy the returned acknowledgment ID promptly:"]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-bash",children:`gcloud pubsub subscriptions ack mlops-predictions-lab \\
  --project YOUR_PROJECT --ack-ids='ACK_ID_FROM_PULL'
`})}),`
`,e.jsx(s.p,{children:"Do not use the service message ID as the acknowledgment ID. If the deadline expires, redelivery is possible and the old acknowledgment ID can become stale; pull again and use the new delivery's ID. Redelivery timing is not an exact timer. An acknowledged message should ordinarily disappear from outstanding delivery, but a default subscription still requires duplicate-safe processing."}),`
`,e.jsx(s.p,{children:"To explore fan-out, create a second subscription before publishing a new event and pull once from each subscription. Both should have access to that new event independently."}),`
`,e.jsx(s.h2,{children:"From inspection to inference"}),`
`,e.jsxs(s.p,{children:["In a real consumer, perform the durable prediction write before acknowledging. If writing fails, retry or let the message be redelivered. If the message is permanently invalid, route it to a monitored quarantine or configured ",e.jsx(s.strong,{children:"dead-letter topic"})," instead of retrying it forever. Configure the required dead-letter permissions and a subscription that retains those forwarded messages."]}),`
`,e.jsxs(s.p,{children:["An application ",e.jsx(s.code,{children:"event_id"})," represents the logical trip event. A service message ID identifies a publication: two separate publish calls for the same event can produce distinct message IDs. Deduplicate by the logical event ID and the intended prediction version, with the check and write in one durable transaction."]}),`
`,e.jsx(c,{prompt:"A consumer acknowledges first and then crashes before saving its prediction. Is automatic redelivery a safe recovery plan?",options:["Yes, Pub/Sub inspects the prediction database","No, the service has already been told the work completed"],correct:1,children:e.jsx(s.p,{children:"Acknowledgment does not verify your business outcome. Persist first, then acknowledge. A crash between those operations may replay the event, so keep the output write idempotent."})}),`
`,e.jsx(s.h2,{children:"Ordering and exactly-once scope"}),`
`,e.jsx(s.p,{children:"Ordering can be enabled per ordering key with the documented regional and publisher requirements; it is not global topic order. Exactly-once delivery is an opt-in feature for supported pull subscriptions with regional requirements. It does not apply to push subscriptions and does not atomically commit your database transaction with the acknowledgment. Publisher-side duplicate events also remain an application concern."}),`
`,e.jsx(s.h2,{children:"Cleanup"}),`
`,e.jsx(s.p,{children:"After finishing, delete only the resources created for this lab. Delete any additional fan-out lab subscription too."}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-bash",children:`gcloud pubsub subscriptions delete mlops-predictions-lab --project YOUR_PROJECT
gcloud pubsub topics delete mlops-trips-lab --project YOUR_PROJECT
`})}),`
`,e.jsx(r,{question:"Prediction and audit consumers must each see an event. Which arrangement provides independent delivery?",options:["Two workers on one subscription","Two subscriptions attached to the same topic","One acknowledgment ID reused forever"],correct:1,explanation:"Independent subscriptions each track delivery. Workers sharing a subscription cooperate on that subscription's workload."}),`
`,e.jsx(a,{title:"TL;DR",children:e.jsx(s.p,{children:"Use a topic to publish and a subscription to consume. Acknowledge completed durable work, handle replay by event ID, and check the scope of ordering and exactly-once features."})}),`
`,e.jsx(s.h2,{children:"References"}),`
`,e.jsxs(s.p,{children:["Use the ",e.jsx(s.a,{href:"https://docs.cloud.google.com/pubsub/docs/publish-receive-messages-gcloud",children:"Pub/Sub CLI quickstart"}),", ",e.jsx(s.a,{href:"https://docs.cloud.google.com/pubsub/docs/subscriber",children:"subscription guide"}),", ",e.jsx(s.a,{href:"https://docs.cloud.google.com/pubsub/docs/ordering",children:"ordering documentation"}),", and ",e.jsx(s.a,{href:"https://docs.cloud.google.com/pubsub/docs/exactly-once-delivery",children:"exactly-once delivery documentation"}),"."]})]})}function p(n={}){const{wrapper:s}={...i(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(t,{...n})}):t(n)}export{p as default};
