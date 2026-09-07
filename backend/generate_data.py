#!/usr/bin/env python3
"""
Repeat-Failure Root-Cause Dataset Generator for Mining Heavy Vehicles
Generates synthetic CSV files for vehicles, work orders, fault telemetry, and baseline metrics.
Uses standard Python library (random, csv, datetime, json) for guaranteed portability.
"""

import csv
import json
import os
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")
os.makedirs(DATA_DIR, exist_ok=True)

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

SITES = ["Pilbara North Pit", "Pilbara South Ridge", "West Mesa Haulage", "Eastern Cut"]
DUTY_CLASSES = ["Ultra-Heavy", "Heavy", "Standard", "Severe-Haul"]
VEHICLE_MODELS = [
    ("Haul Truck", "Caterpillar", "793F (250t)"),
    ("Haul Truck", "Komatsu", "930E-5 (290t)"),
    ("Haul Truck", "Liebherr", "T 284 (360t)"),
    ("Hydraulic Excavator", "Hitachi", "EX5600-6"),
    ("Hydraulic Excavator", "Caterpillar", "6060 FS"),
    ("Wheel Loader", "Caterpillar", "994K"),
    ("Wheel Loader", "Komatsu", "WA900-8R"),
    ("Track Dozer", "Caterpillar", "D11T CD"),
    ("Drill Rig", "Sandvik", "DR412i Rotary")
]

def generate_dataset():
    vehicles = []
    # Dedicated demo vehicle HT-042
    vehicles.append({
        "vehicle_id": "HT-042",
        "vehicle_type": "Haul Truck",
        "manufacturer": "Caterpillar",
        "model": "793F (250t)",
        "age_years": 4.2,
        "site": "West Mesa Haulage",
        "duty_class": "Ultra-Heavy",
        "operating_hours": 18450,
        "load_profile": "High Payload (+15%)",
        "shift_pattern": "Continuous 24/7",
        "status": "Restricted Duty"
    })

    for i in range(1, 105):
        id_num = str(i).zfill(3)
        v_type, mfg, model = random.choice(VEHICLE_MODELS)
        prefix = "HT" if v_type == "Haul Truck" else "EX" if "Excavator" in v_type else "WL" if "Loader" in v_type else "DZ" if "Dozer" in v_type else "DR"
        v_id = f"{prefix}-{id_num}"
        if v_id == "HT-042":
            continue
        vehicles.append({
            "vehicle_id": v_id,
            "vehicle_type": v_type,
            "manufacturer": mfg,
            "model": model,
            "age_years": round(random.uniform(1.0, 9.5), 1),
            "site": random.choice(SITES),
            "duty_class": random.choice(DUTY_CLASSES),
            "operating_hours": random.randint(3200, 38000),
            "load_profile": random.choice(["Standard Payload", "High Payload (+15%)", "Extreme Overload (+25%)"]),
            "shift_pattern": random.choice(["Continuous 24/7", "Two Shifts", "Day Only"]),
            "status": "In Service"
        })

    # Save vehicles.csv
    veh_path = os.path.join(DATA_DIR, "vehicles.csv")
    with open(veh_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=vehicles[0].keys())
        writer.writeheader()
        writer.writerows(vehicles)

    print(f"Generated {len(vehicles)} vehicles in {veh_path}")

if __name__ == "__main__":
    generate_dataset()
