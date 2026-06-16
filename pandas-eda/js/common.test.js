const assert = require('assert');
const {
  TAXI_SAMPLE_DATA, computeMissingRatio, computeIQRBounds, applyFillna,
  filterInvalid, decomposeDatetime, computeCorrelationMatrix, buildPivotTable
} = require('./common.js');

const ratios = computeMissingRatio(TAXI_SAMPLE_DATA, ['passenger_count', 'RatecodeID', 'airport_fee']);
assert.strictEqual(ratios.passenger_count, 6.67);
assert.strictEqual(ratios.RatecodeID, 6.67);
assert.strictEqual(ratios.airport_fee, 6.67);

const fareIQR = computeIQRBounds(TAXI_SAMPLE_DATA, 'fare_amount', 1.5);
assert.strictEqual(fareIQR.q1, 6.125);
assert.strictEqual(fareIQR.q3, 19.125);
assert.deepStrictEqual(fareIQR.outlierIds.slice().sort(function(a,b){return a-b;}), [6, 18, 26]);

const distIQR = computeIQRBounds(TAXI_SAMPLE_DATA, 'trip_distance', 1.5);
assert.deepStrictEqual(distIQR.outlierIds, [24]);

const filledPassengers = applyFillna(TAXI_SAMPLE_DATA, 'passenger_count', 'mode');
assert.strictEqual(filledPassengers.filter(function(r){return r.passenger_count === null;}).length, 0);
assert.strictEqual(filledPassengers.length, 30);
assert.strictEqual(filledPassengers.find(function(r){return r.id === 9;}).passenger_count, 1);

const invalidResult = filterInvalid(TAXI_SAMPLE_DATA, [
  { col: 'fare_amount', op: 'negative' },
  { col: 'trip_distance', op: 'zero' }
]);
assert.strictEqual(invalidResult.before, 30);
assert.strictEqual(invalidResult.after, 24);

const dt = decomposeDatetime('2023-03-06T08:15:00', '2023-03-06T08:32:00');
assert.strictEqual(dt.hour, 8);
assert.strictEqual(dt.dayOfWeek, 0); // Monday
assert.strictEqual(dt.durationMinutes, 17);

const corr = computeCorrelationMatrix(TAXI_SAMPLE_DATA, ['fare_amount', 'total_amount']);
assert.ok(corr.fare_amount.total_amount > 0.99);

const pivot = buildPivotTable(TAXI_SAMPLE_DATA, 'PUBorough', 'payment_type', 'fare_amount', 'mean');
assert.strictEqual(pivot['Staten Island'].card, 399);
assert.strictEqual(pivot['Bronx'].card, null);

console.log('All common.js helper checks passed.');
