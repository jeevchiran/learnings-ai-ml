import{u as i,j as e,C as o,B as s,D as c,a as t,Q as d}from"./index-VIW80S6x.js";function a(r){const n={code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{children:"Data Quality & Invalid Values"}),`
`,e.jsx(n.h2,{children:"Why This Topic?"}),`
`,e.jsxs(n.p,{children:["Passing every ",e.jsx(n.code,{children:"isna()"})," check doesn't mean a value is valid. Module 1 flagged a ",e.jsx(n.strong,{children:"-12.50"})," fare in ",e.jsx(n.code,{children:".describe()"}),`'s minimum — it's "present," just nonsensical. No null check on earth will catch it, because the cell isn't empty. It's just wrong.`]}),`
`,e.jsx(o,{title:"Missing vs. invalid: two different failure modes",children:e.jsxs(n.p,{children:["A ",e.jsx(n.strong,{children:"missing"})," value is absent — ",e.jsx(n.code,{children:"NaN"}),", caught by ",e.jsx(n.code,{children:".isna()"}),". An ",e.jsx(n.strong,{children:"invalid"})," value is present but violates a domain rule specific to what the column means: a fare can't be negative, a rate code must come from a documented set. Catching the second kind requires knowing the business rules of the data, not just calling a generic pandas method."]})}),`
`,e.jsx(s,{children:e.jsx(n.p,{children:"This dataset is NYC taxi trips, so the domain constraints are concrete: fares can't be negative; a zero-distance trip charged a real fare is suspicious (not impossible — a canceled ride can still trigger a minimum charge); and rate codes outside the documented set are worth a sanity check."})}),`
`,e.jsx(n.h2,{children:"What / How — Domain Constraints as Boolean Masks"}),`
`,e.jsx(n.p,{children:"Each constraint becomes a boolean mask: a condition that should never be true for a healthy row. Filtering the DataFrame with that mask surfaces exactly the rows that broke the rule."}),`
`,e.jsxs(c,{children:[e.jsx(t,{number:1,title:"fare_amount < 0 — a fare can't be negative",children:e.jsx(n.p,{children:"A taxi fare is a charge for a service rendered; it cannot be less than zero. Any row here is a data error — likely a refund or billing-reversal record that leaked into the fare column instead of being modeled separately."})}),e.jsx(t,{number:2,title:"(trip_distance == 0) & (fare_amount > 0) — paid for a trip that didn't move",children:e.jsxs(n.p,{children:["Not impossible — a canceled ride can still trigger a minimum charge — but worth flagging. Compare against a row where both ",e.jsx(n.code,{children:"trip_distance"})," and ",e.jsx(n.code,{children:"fare_amount"})," are zero: that's a true non-event, not a data error."]})}),e.jsx(t,{number:3,title:"RatecodeID outside 1-6 — an undocumented category",children:e.jsx(n.p,{children:"The NYC TLC documents rate codes 1 through 6 (standard, JFK, Newark, Nassau/Westchester, negotiated fare, group ride). A value outside that set — or unexpectedly missing — means the column needs a closer look before it's trusted in any groupby."})})]}),`
`,e.jsx(n.p,{children:"Run the first two checks on the full sample:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`bad_fare = df[df.fare_amount < 0]
bad_distance = df[(df.trip_distance == 0) & (df.fare_amount > 0)]
print(f"Negative fares: {len(bad_fare)} rows")
print(f"Zero-distance trips charged a fare: {len(bad_distance)} rows")
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`Negative fares: 2 rows
Zero-distance trips charged a fare: 4 rows
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Two independent issues, not one bug wearing two faces."})," ",e.jsx(n.code,{children:"df[(df.fare_amount < 0) & (df.trip_distance == 0)]"})," returns ",e.jsx(n.strong,{children:"0 rows"})," — the negative-fare rows (ids 7, 15) are different rows from the zero-distance-but-charged rows (ids 5, 11, 20, 30). The two issues never co-occur in this sample, which is itself a clue: they likely trace back to two distinct root causes (a billing-reversal glitch vs. a canceled-trip minimum charge), not a single shared defect."]}),`
`,e.jsxs(n.p,{children:["Now check the categorical column. A category with unexpected values hides differently than a numeric one — ",e.jsx(n.code,{children:".value_counts(dropna=False)"})," is the tool that surfaces it:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-python",children:`print(df.RatecodeID.value_counts(dropna=False))
`})}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`1.0    26
2.0     2
NaN     2
Name: RatecodeID, count: dtype: int64
`})}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Both categories observed are valid — but the NaNs aren't a category at all."})," Every non-null value falls inside the documented 1-6 range, so there's no undocumented rate code lurking here. But ",e.jsx(n.code,{children:"dropna=False"})," is what reveals the 2 missing rows in the first place — the default ",e.jsx(n.code,{children:"dropna=True"}),' would have silently hidden them from this exact count. "Known" here means present ',e.jsx(n.em,{children:"and"})," inside 1-6; a ",e.jsx(n.code,{children:"NaN"})," fails the check on the first half."]}),`
`,e.jsx(s,{children:e.jsx(n.p,{children:"Reading these prints one constraint at a time is fine for a report. The widget below lets you stack all three rules live and watch exactly which rows survive."})}),`
`,e.jsx(n.h2,{children:"Practice"}),`
`,e.jsx(n.h3,{children:"Problem 1: The Negative-Fare Mask"}),`
`,e.jsx(n.p,{children:"Write the boolean mask that finds rows with a negative fare."}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," ",e.jsx(n.code,{children:"df[df.fare_amount < 0]"})," → 2 rows (ids 7, 15). ",e.jsx(n.code,{children:"df.fare_amount < 0"})," alone produces a boolean Series, one ",e.jsx(n.code,{children:"True"}),"/",e.jsx(n.code,{children:"False"})," per row; wrapping it in ",e.jsx(n.code,{children:"df[...]"})," uses that Series to filter the DataFrame down to only the rows where it's ",e.jsx(n.code,{children:"True"}),"."]}),`
`,e.jsx(n.h3,{children:"Problem 2: Should Zero-Distance Always Be Dropped?"}),`
`,e.jsxs(n.p,{children:["Should you always drop every row where ",e.jsx(n.code,{children:"trip_distance == 0"}),"?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," Not necessarily — a genuinely canceled trip can still incur a minimum charge with 0 recorded distance, which is a real (if edge-case) business event, not a data error. The safer move is to flag and inspect rather than blindly delete: check whether the fare is also $0 (truly a non-event) versus a positive minimum fare (a real but unusual charge). This dataset's own zero-distance rows (ids 5, 11, 20, 30) all carry a small positive fare — exactly the minimum-charge case, not a true non-event."]}),`
`,e.jsx(n.h3,{children:"Problem 3: Do the Two Problems Overlap?"}),`
`,e.jsxs(n.p,{children:["Confirm whether any row is ",e.jsx(n.em,{children:"both"})," zero-distance and negative-fare by combining the two masks with ",e.jsx(n.code,{children:"&"}),". What does the empty result tell you about the two issues?"]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Solution:"})," ",e.jsx(n.code,{children:"df[(df.trip_distance == 0) & (df.fare_amount < 0)]"})," returns ",e.jsx(n.strong,{children:"0 rows"}),". The two data-quality problems never co-occur in this sample, suggesting they come from separate causes — a refund/dispute process producing negative fares vs. a minimum-charge policy producing zero-distance, nonzero-fare rows — rather than one shared bug."]}),`
`,e.jsx(n.h2,{children:"Quiz"}),`
`,e.jsx(n.h3,{children:"Module 3 — Check Your Understanding"}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["1. What does ",e.jsx(n.code,{children:"df[df.fare_amount < 0]"})," return?"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: A boolean Series, one entry per row"}),`
`,e.jsx(n.li,{children:"B: A filtered DataFrame containing only the rows where the condition is True ✓"}),`
`,e.jsx(n.li,{children:"C: A single column of fare amounts"}),`
`,e.jsx(n.li,{children:"D: A count of matching rows"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"2. Which pandas operator combines two boolean Series with logical AND?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: and"}),`
`,e.jsx(n.li,{children:"B: & ✓"}),`
`,e.jsx(n.li,{children:"C: +"}),`
`,e.jsx(n.li,{children:"D: |"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["3. Why check ",e.jsx(n.code,{children:".value_counts(dropna=False)"})," on ",e.jsx(n.code,{children:"RatecodeID"})," before cleaning?"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: To spot unexpected or missing categories that fall outside the documented rate codes ✓"}),`
`,e.jsx(n.li,{children:"B: To compute the column's mean"}),`
`,e.jsx(n.li,{children:"C: Because dropna=False runs faster than the default"}),`
`,e.jsx(n.li,{children:"D: To convert the column to a string dtype"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsxs(n.strong,{children:["4. A row with ",e.jsx(n.code,{children:"trip_distance == 0"})," and ",e.jsx(n.code,{children:"fare_amount == 0"})," together most likely represents:"]})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A: A data entry error that must be dropped immediately"}),`
`,e.jsx(n.li,{children:"B: A negative-fare billing reversal"}),`
`,e.jsx(n.li,{children:"C: A trip that was started and immediately canceled with no charge ✓"}),`
`,e.jsx(n.li,{children:"D: An undocumented RatecodeID"}),`
`]}),`
`,e.jsx(s,{children:e.jsxs(n.p,{children:[e.jsx(n.strong,{children:`What's next: when "wrong" becomes a matter of degree.`}),` Invalid values here were caught with a hard boolean rule — a fare is either negative or it isn't. But how far is "too far" before a `,e.jsx(n.em,{children:"positive"}),", plausible-looking value still counts as wrong? Module 4 makes that boundary statistical: the IQR method."]})}),`
`,e.jsx(d,{question:"Which operator performs element-wise logical AND on two pandas boolean Series?",options:["and","or","&","+"],correct:2})]})}function h(r={}){const{wrapper:n}={...i(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(a,{...r})}):a(r)}export{h as default};
