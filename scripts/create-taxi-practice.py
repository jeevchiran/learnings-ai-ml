"""Reproduce the synthetic teaching fixture; these are not real NYC trips."""
import csv
from datetime import datetime, timedelta
from pathlib import Path

fares = [6, 6.5, 7, 8, 3, 45, -12.5, 9, 10, 11, 3.5, 11.5, 12, 13, -3.5,
         14, 15, 52, 16, 4, 17, 18, 19.5, 20, 21, 399, 22, 27.6, 5.5, 5]
path = Path(__file__).resolve().parents[1] / 'react-app/public/data/taxi_practice.csv'
path.parent.mkdir(parents=True, exist_ok=True)
columns = ['id', 'tpep_pickup_datetime', 'tpep_dropoff_datetime', 'passenger_count',
           'trip_distance', 'RatecodeID', 'payment_type', 'fare_amount', 'tip_amount',
           'airport_fee', 'PUBorough', 'DOBorough']
with path.open('w', encoding='utf-8', newline='') as handle:
    writer = csv.DictWriter(handle, fieldnames=columns)
    writer.writeheader()
    for i, fare in enumerate(fares, 1):
        airport = i in (6, 18)
        pickup = datetime(2023, 3, 1) + timedelta(hours=(i * 5) % 72)
        writer.writerow(dict(zip(columns, [
            i, pickup.isoformat(' '), (pickup + timedelta(minutes=8 + i)).isoformat(' '),
            '' if i in (8, 22) else 1 + i % 4,
            0 if i in (5, 11, 20, 30) else 6.7 if i == 26 else 18 if airport else round(max(fare, 0) / 4, 2),
            '' if i in (13, 25) else 2 if airport else 1,
            1 if i % 3 else 2, fare, round(max(fare, 0) * 0.15, 2) if i % 3 else 0,
            '' if i in (4, 10) else 1.25 if airport else 0,
            'Manhattan', 'Queens' if airport else 'Manhattan',
        ])))
print(path)
