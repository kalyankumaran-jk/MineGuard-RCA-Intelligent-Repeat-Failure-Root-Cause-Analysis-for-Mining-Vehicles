import { Vehicle, WorkOrder, VehicleType, DutyClass, ShiftType, SeverityLevel } from '../types';

// Deterministic pseudo-random number generator for reproducible synthetic dataset (Seed: 42)
class SeededRandom {
  private seed: number;
  constructor(seed = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  choice<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
}

export function generateSyntheticDataset(seed = 42) {
  const rng = new SeededRandom(seed);

  // 1. Generate 105 Vehicles
  const vehicles: Vehicle[] = [];
  const sites = ['Pilbara North Pit', 'Pilbara South Ridge', 'West Mesa Haulage', 'Eastern Cut'];
  const dutyClasses: DutyClass[] = ['Ultra-Heavy', 'Heavy', 'Standard', 'Severe-Haul'];
  const shiftPatterns: Vehicle['shift_pattern'][] = ['Continuous 24/7', 'Two Shifts', 'Day Only'];
  const loadProfiles: Vehicle['load_profile'][] = ['Standard Payload', 'High Payload (+15%)', 'Extreme Overload (+25%)'];

  const vehicleModels: { type: VehicleType; mfg: string; model: string }[] = [
    { type: 'Haul Truck', mfg: 'Caterpillar', model: '793F (250t)' },
    { type: 'Haul Truck', mfg: 'Komatsu', model: '930E-5 (290t)' },
    { type: 'Haul Truck', mfg: 'Liebherr', model: 'T 284 (360t)' },
    { type: 'Hydraulic Excavator', mfg: 'Hitachi', model: 'EX5600-6' },
    { type: 'Hydraulic Excavator', mfg: 'Caterpillar', model: '6060 FS' },
    { type: 'Wheel Loader', mfg: 'Caterpillar', model: '994K' },
    { type: 'Wheel Loader', mfg: 'Komatsu', model: 'WA900-8R' },
    { type: 'Track Dozer', mfg: 'Caterpillar', model: 'D11T CD' },
    { type: 'Drill Rig', mfg: 'Sandvik', model: 'DR412i Rotary' },
  ];

  // Specific canonical demo vehicle HT-042
  vehicles.push({
    vehicle_id: 'HT-042',
    vehicle_type: 'Haul Truck',
    manufacturer: 'Caterpillar',
    model: '793F (250t)',
    age_years: 4.2,
    site: 'West Mesa Haulage',
    duty_class: 'Ultra-Heavy',
    operating_hours: 18450,
    load_profile: 'High Payload (+15%)',
    shift_pattern: 'Continuous 24/7',
    status: 'Restricted Duty',
  });

  // Other 104 vehicles
  for (let i = 1; i <= 104; i++) {
    const idNum = i.toString().padStart(3, '0');
    const vm = rng.choice(vehicleModels);
    let prefix = 'HT';
    if (vm.type === 'Hydraulic Excavator') prefix = 'EX';
    else if (vm.type === 'Wheel Loader') prefix = 'WL';
    else if (vm.type === 'Track Dozer') prefix = 'DZ';
    else if (vm.type === 'Drill Rig') prefix = 'DR';

    const vId = `${prefix}-${idNum}`;
    // skip HT-042 as it was explicitly added
    if (vId === 'HT-042') continue;

    vehicles.push({
      vehicle_id: vId,
      vehicle_type: vm.type,
      manufacturer: vm.mfg,
      model: vm.model,
      age_years: Number(rng.range(1.0, 9.5).toFixed(1)),
      site: rng.choice(sites),
      duty_class: rng.choice(dutyClasses),
      operating_hours: rng.int(3200, 38000),
      load_profile: rng.choice(loadProfiles),
      shift_pattern: rng.choice(shiftPatterns),
      status: rng.next() > 0.88 ? 'Under Maintenance' : rng.next() > 0.95 ? 'Restricted Duty' : 'In Service',
    });
  }

  // 2. Generate Work Orders
  const workOrders: WorkOrder[] = [];
  const technicians = [
    'Marcus Thorne (Senior Mechanical)',
    'Sarah Jenkins (Reliability Tech)',
    'Devon Vance (Hydraulics Specialist)',
    'Chloe Patel (Auto-Electrical Tech)',
    'Liam O’Connor (Heavy Vehicle Master)',
    'Aiden Brooks (Diagnostics Tech)',
    'Ravi Nair (Field Service Tech)'
  ];

  const envConditions = [
    'High Dust & Airborne Particulate',
    'Extreme Ambient Heat (44°C)',
    'High Ambient Heat (38°C) + Dry Winds',
    'Wet Muddy Sump Conditions',
    'Severe Continuous Vibration',
    'Heavy Night Fog / High Humidity',
    'Normal Pit Environment (28°C)'
  ];

  const terrainConditions = [
    'Steep Haul Ramp (12% to 14% grade)',
    'Severe Corrugated Pit Floor',
    'Hard Rock Bench with Heavy Jarring',
    'Loose Unconsolidated Dump Ramp',
    'Standard Main Haul Road'
  ];

  // Helper date generator spanning Jan 2026 to Aug 2026
  function makeDate(month: number, day: number): string {
    const m = month.toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `2026-${m}-${d}`;
  }

  let woCounter = 1000;

  // CLUSTER 1: DEMO CASE HT-042 (Engine Overheating / Dust restriction)
  const c1Orders: Partial<WorkOrder>[] = [
    {
      date: '2026-03-12',
      shift: 'Day (06:00-18:00)',
      symptom: 'Engine Coolant Temperature High (>108°C) Under High Dump Incline',
      fault_code: 'F-ENG-102',
      fault_code_desc: 'Engine Coolant High Temp Alert - Threshold Exceeded',
      severity: 'High',
      downtime_hours: 4.5,
      repair_action: 'Replaced primary coolant cartridge filter; topped up 50/50 ethylene glycol coolant',
      technician: 'Marcus Thorne (Senior Mechanical)',
      replaced_part: 'Coolant Cartridge Filter Element',
      part_id: 'PRT-FLT-8821',
      repair_duration: 2.5,
      operating_hours_at_failure: 17200,
      environmental_condition: 'High Dust & Airborne Particulate',
      load_condition: 'High Payload (+15%)',
      terrain_condition: 'Steep Haul Ramp (12% to 14% grade)',
      recurrence_count: 1,
      true_root_cause: 'Cooling-System Airflow Restriction (External Fin Clogging) from Heavy Dust + Inadequate Pre-Cleaner',
    },
    {
      date: '2026-03-24', // 12 days later!
      shift: 'Day (06:00-18:00)',
      symptom: 'Engine Temperature High Alert, Automatic Power Derate Triggered',
      fault_code: 'F-ENG-107',
      fault_code_desc: 'Radiator Inlet/Outlet Delta Pressure & Fan Command Maxed',
      severity: 'High',
      downtime_hours: 5.0,
      repair_action: 'Flushed coolant passages, replaced coolant filter again, verified thermostat opening',
      technician: 'Aiden Brooks (Diagnostics Tech)',
      replaced_part: 'Coolant Cartridge Filter Element',
      part_id: 'PRT-FLT-8821',
      repair_duration: 3.0,
      operating_hours_at_failure: 17450,
      environmental_condition: 'High Dust & Airborne Particulate',
      load_condition: 'High Payload (+15%)',
      terrain_condition: 'Steep Haul Ramp (12% to 14% grade)',
      recurrence_count: 2,
      true_root_cause: 'Cooling-System Airflow Restriction (External Fin Clogging) from Heavy Dust + Inadequate Pre-Cleaner',
    },
    {
      date: '2026-04-06', // 13 days later!
      shift: 'Night (18:00-06:00)',
      symptom: 'Repeated Overheating on Incline, Engine Alarm Siren Sounded',
      fault_code: 'F-ENG-102',
      fault_code_desc: 'Engine Coolant High Temp Alert - Threshold Exceeded',
      severity: 'Critical',
      downtime_hours: 8.5,
      repair_action: 'Swapped coolant pump impeller assembly and replaced coolant filter for 3rd time',
      technician: 'Liam O’Connor (Heavy Vehicle Master)',
      replaced_part: 'Coolant Pump Impeller Assembly',
      part_id: 'PRT-PMP-3310',
      repair_duration: 6.0,
      operating_hours_at_failure: 17720,
      environmental_condition: 'Extreme Ambient Heat (44°C) + High Dust',
      load_condition: 'Extreme Overload (+25%)',
      terrain_condition: 'Steep Haul Ramp (12% to 14% grade)',
      recurrence_count: 3,
      true_root_cause: 'Cooling-System Airflow Restriction (External Fin Clogging) from Heavy Dust + Inadequate Pre-Cleaner',
    },
    {
      date: '2026-04-22', // 16 days later!
      shift: 'Day (06:00-18:00)',
      symptom: 'Critical Engine Overheating Derate to 40% Capacity While Hauling Out of Cut',
      fault_code: 'F-ENG-115',
      fault_code_desc: 'Auxiliary Hydraulic Cooling Fan Drive Pressure Saturation',
      severity: 'Critical',
      downtime_hours: 9.0,
      repair_action: 'Quick spray of external radiator with pressurized water, replaced temp sensor',
      technician: 'Marcus Thorne (Senior Mechanical)',
      replaced_part: 'Coolant Temperature Sender Sensor',
      part_id: 'PRT-SNS-4091',
      repair_duration: 4.0,
      operating_hours_at_failure: 18050,
      environmental_condition: 'High Dust & Airborne Particulate',
      load_condition: 'High Payload (+15%)',
      terrain_condition: 'Steep Haul Ramp (12% to 14% grade)',
      recurrence_count: 4,
      true_root_cause: 'Cooling-System Airflow Restriction (External Fin Clogging) from Heavy Dust + Inadequate Pre-Cleaner',
    }
  ];

  let prevId: string | undefined = undefined;
  for (const c of c1Orders) {
    woCounter++;
    const woId = `WO-${woCounter}`;
    workOrders.push({
      work_order_id: woId,
      vehicle_id: 'HT-042',
      date: c.date!,
      shift: c.shift as ShiftType,
      failure_category: 'Engine',
      symptom: c.symptom!,
      fault_code: c.fault_code!,
      fault_code_desc: c.fault_code_desc!,
      severity: c.severity as SeverityLevel,
      downtime_hours: c.downtime_hours!,
      repair_action: c.repair_action!,
      technician: c.technician!,
      replaced_part: c.replaced_part!,
      part_id: c.part_id!,
      repair_duration: c.repair_duration!,
      operating_hours_at_failure: c.operating_hours_at_failure!,
      environmental_condition: c.environmental_condition!,
      load_condition: c.load_condition!,
      terrain_condition: c.terrain_condition!,
      recurrence_count: c.recurrence_count!,
      previous_work_order_id: prevId,
      true_root_cause: c.true_root_cause,
      is_repeat_failure: true,
    });
    prevId = woId;
  }

  // Pre-seed 6 distinct recurring failure clusters across key vehicles
  const recurringArchetypes = [
    {
      vehicle_id: 'HT-018',
      category: 'Braking' as const,
      root_cause: 'Continuous Downhill Dynamic Retarding Thermal Overstress from Ramp Over-speed',
      symptom: 'Wheel Brake Disc Heat Discoloration & Rapid Friction Puck Glazing',
      fault_code: 'F-BRK-401',
      fault_desc: 'Brake Oil Retarder Over-Temperature (>130°C)',
      part: 'Brake Wet Disc Friction Pack',
      part_id: 'PRT-BRK-9902',
      repair: 'Replaced wet brake disc pack and flushed retarder cooling oil',
      env: 'High Ambient Heat (38°C) + Dry Winds',
      load: 'Extreme Overload (+25%)',
      terrain: 'Steep Haul Ramp (12% to 14% grade)',
      dates: ['2026-02-10', '2026-02-28', '2026-03-19', '2026-04-11'],
    },
    {
      vehicle_id: 'EX-003',
      category: 'Hydraulics' as const,
      root_cause: 'Suction Line Aeration & Resonating Cavitation during High-Flow Boom Swing',
      symptom: 'Main Hydraulic Pump Whine & High-Frequency Pressure Flutter',
      fault_code: 'F-HYD-210',
      fault_desc: 'Hydraulic Main Pump Discharge Pressure Fluctuations (>40 bar P-P)',
      part: 'Variable Displacement Axial Piston Pump',
      part_id: 'PRT-HYD-5501',
      repair: 'Replaced hydraulic pump cartridge and high pressure return filter',
      env: 'Severe Continuous Vibration',
      load: 'Full Capacity',
      terrain: 'Hard Rock Bench with Heavy Jarring',
      dates: ['2026-01-22', '2026-02-14', '2026-03-05', '2026-03-29'],
    },
    {
      vehicle_id: 'HT-077',
      category: 'Engine' as const,
      root_cause: 'Turbocharger Center Housing Oil Coking from Hot Engine Shutdown without Cool-Down Idle',
      symptom: 'Turbocharger Shaft Play & Excessive Blue Smoke on Cold Acceleration',
      fault_code: 'F-ENG-304',
      fault_desc: 'Turbo Boost Pressure Target Deviation (>0.35 bar under target)',
      part: 'Twin Turbocharger Core Assembly',
      part_id: 'PRT-TRB-7120',
      repair: 'Replaced turbocharger core assembly and oil supply banjo lines',
      env: 'High Dust & Airborne Particulate',
      load: 'High Payload (+15%)',
      terrain: 'Steep Haul Ramp (12% to 14% grade)',
      dates: ['2026-02-04', '2026-02-26', '2026-03-21', '2026-04-18'],
    },
    {
      vehicle_id: 'HT-091',
      category: 'Electrical/Drive' as const,
      root_cause: 'IGBT Inverter Gate Driver Chafing Harness Caused by Corrugated Road Vibration',
      symptom: 'AC Traction Drive Intermittent Inverter Trip and Torque Loss',
      fault_code: 'F-ELC-808',
      fault_desc: 'Phase U-V Traction Inverter Gate Driver Desaturation Trip',
      part: 'IGBT Inverter Driver Module',
      part_id: 'PRT-ELC-1044',
      repair: 'Swapped inverter IGBT module and reset drive control unit',
      env: 'Severe Continuous Vibration',
      load: 'Standard Payload',
      terrain: 'Severe Corrugated Pit Floor',
      dates: ['2026-03-01', '2026-03-18', '2026-04-02', '2026-04-20'],
    },
    {
      vehicle_id: 'DZ-005',
      category: 'Structural/Chassis' as const,
      root_cause: 'Fine Silica Slurry Ingress Destroying Track Pin Seals under Wet Pit Trenching',
      symptom: 'Track Link Seizure & Pin Galling Causing Extreme Bushing Ovalization',
      fault_code: 'F-STR-612',
      fault_desc: 'Final Drive Sprocket Torque Asymmetry (>25% differential)',
      part: 'Heavy Sealed & Lubricated Track Pin Kit',
      part_id: 'PRT-STR-4429',
      repair: 'Pressed out worn track pins, replaced 4 links and re-tensioned grease cylinder',
      env: 'Wet Muddy Sump Conditions',
      load: 'Full Capacity',
      terrain: 'Loose Unconsolidated Dump Ramp',
      dates: ['2026-01-18', '2026-02-12', '2026-03-08', '2026-03-30'],
    }
  ];

  for (const arch of recurringArchetypes) {
    let archPrevId: string | undefined = undefined;
    for (let r = 0; r < arch.dates.length; r++) {
      woCounter++;
      const woId = `WO-${woCounter}`;
      workOrders.push({
        work_order_id: woId,
        vehicle_id: arch.vehicle_id,
        date: arch.dates[r],
        shift: r % 2 === 0 ? 'Day (06:00-18:00)' : 'Night (18:00-06:00)',
        failure_category: arch.category,
        symptom: arch.symptom,
        fault_code: arch.fault_code,
        fault_code_desc: arch.fault_desc,
        severity: r >= 2 ? 'Critical' : 'High',
        downtime_hours: Number((4.0 + r * 1.5 + rng.range(0.2, 1.2)).toFixed(1)),
        repair_action: arch.repair,
        technician: rng.choice(technicians),
        replaced_part: arch.part,
        part_id: arch.part_id,
        repair_duration: Number((2.5 + r * 0.8).toFixed(1)),
        operating_hours_at_failure: 12000 + r * 450,
        environmental_condition: arch.env,
        load_condition: arch.load,
        terrain_condition: arch.terrain,
        recurrence_count: r + 1,
        previous_work_order_id: archPrevId,
        true_root_cause: arch.root_cause,
        is_repeat_failure: true,
      });
      archPrevId = woId;
    }
  }

  // Common standard maintenance events library for generating the rest of the 1,180+ work orders
  const failureLib = [
    {
      cat: 'Engine' as const,
      symptom: 'Fuel Injector Nozzle Clogging Causing Cylinder Misfire',
      fault: 'F-ENG-204',
      desc: 'Cylinder #6 Fuel Rail Pressure Drop During Acceleration',
      part: 'Common Rail High Pressure Fuel Injector',
      part_id: 'PRT-ENG-6110',
      action: 'Replaced fuel injector #6, performed electronic calibration',
      downtime: 3.5,
      dur: 2.0,
      root: 'Fuel Storage Tank Sediment Contamination',
    },
    {
      cat: 'Hydraulics' as const,
      symptom: 'Steering Cylinder Hydraulic Hose Sheath Abrasion Leaking Fluid',
      fault: 'F-HYD-109',
      desc: 'Steering Accumulator Low Charge Pressure Warning',
      part: 'Four-Spiral High Pressure Hydraulic Hose (2-inch)',
      part_id: 'PRT-HYD-2033',
      action: 'Replaced abraded hydraulic hose assembly, bled steering circuit',
      downtime: 2.5,
      dur: 1.5,
      root: 'Missing Hose Clamp Chassis Saddle Bracket',
    },
    {
      cat: 'Braking' as const,
      symptom: 'Park Brake Caliper Piston Seal Minor Seepage',
      fault: 'F-BRK-215',
      desc: 'Secondary Brake Circuit Pressure Depletion Alert',
      part: 'Spring-Applied Hydraulic Release Caliper Seal Kit',
      part_id: 'PRT-BRK-1109',
      action: 'Rebuilt park brake caliper piston seals and checked disc runout',
      downtime: 4.0,
      dur: 3.0,
      root: 'Thermal Hardening of Nitrile O-Rings',
    },
    {
      cat: 'Electrical/Drive' as const,
      symptom: 'Alternator Diode Bridge Overheating under Auxiliary AC Load',
      fault: 'F-ELC-302',
      desc: '24V DC Chassis System Voltage Fluctuation (<22.8V)',
      part: 'Heavy Duty Brushless 24V 150A Alternator',
      part_id: 'PRT-ELC-7800',
      action: 'Replaced alternator and checked main ground strap resistance',
      downtime: 3.0,
      dur: 1.8,
      root: 'Corroded Master Battery Frame Ground Lug',
    },
    {
      cat: 'Structural/Chassis' as const,
      symptom: 'Dump Body Pivot Bushing Grease Starvation & Grooving',
      fault: 'F-STR-104',
      desc: 'Auto-Lubrication Injector Bank #3 Pressure Failure',
      part: 'Phosphor Bronze Pivot Bushing Sleeve',
      part_id: 'PRT-STR-8901',
      action: 'Pressed in new bronze pivot bushing, cleared auto-lube grease block',
      downtime: 5.5,
      dur: 4.0,
      root: 'Clogged Auto-Lube Secondary Metering Valve',
    },
    {
      cat: 'Engine' as const,
      symptom: 'Exhaust Gas Temperature High on Left Bank Manifold',
      fault: 'F-ENG-511',
      desc: 'Exhaust Pyrometer Temp Exceeded 680°C',
      part: 'Exhaust Manifold Multi-Layer Steel Gasket Kit',
      part_id: 'PRT-ENG-9022',
      action: 'Replaced blown exhaust manifold gasket and torqued studs',
      downtime: 4.5,
      dur: 3.5,
      root: 'Exhaust Manifold Flange Warpage from Rapid Thermal Cycling',
    },
    {
      cat: 'Hydraulics' as const,
      symptom: 'Hoist Cylinder Rod Chrome Peeling & Hydraulic Oil Droplets',
      fault: 'F-HYD-408',
      desc: 'Dump Bed Lowering Velocity Abnormal',
      part: 'Two-Stage Telescopic Hoist Cylinder Seal Set',
      part_id: 'PRT-HYD-6677',
      action: 'Replaced hoist cylinder packing gland and wipers',
      downtime: 6.0,
      dur: 4.5,
      root: 'Airborne Quartz Dust Particle Scratches on Telescopic Stage',
    }
  ];

  // Fill remaining ~1,200 work orders distributed across the 105 vehicles over 240 days
  while (workOrders.length < 1250) {
    woCounter++;
    const v = rng.choice(vehicles);
    const item = rng.choice(failureLib);
    const m = rng.int(1, 8);
    const d = rng.int(1, 28);
    const dateStr = makeDate(m, d);

    // Some vehicles experience repeat failures of this item
    const isRepeat = rng.next() > 0.65;
    const recurrenceCount = isRepeat ? rng.int(2, 4) : 1;

    workOrders.push({
      work_order_id: `WO-${woCounter}`,
      vehicle_id: v.vehicle_id,
      date: dateStr,
      shift: rng.choice(['Day (06:00-18:00)', 'Night (18:00-06:00)']),
      failure_category: item.cat,
      symptom: item.symptom,
      fault_code: item.fault,
      fault_code_desc: item.desc,
      severity: isRepeat ? (rng.next() > 0.5 ? 'Critical' : 'High') : rng.choice(['Medium', 'Low', 'High']),
      downtime_hours: Number((item.downtime + rng.range(-0.8, 2.5)).toFixed(1)),
      repair_action: item.action,
      technician: rng.choice(technicians),
      replaced_part: item.part,
      part_id: item.part_id,
      repair_duration: Number((item.dur + rng.range(-0.4, 1.2)).toFixed(1)),
      operating_hours_at_failure: v.operating_hours - rng.int(50, 4000),
      environmental_condition: rng.choice(envConditions),
      load_condition: v.load_profile,
      terrain_condition: rng.choice(terrainConditions),
      recurrence_count: recurrenceCount,
      true_root_cause: item.root,
      is_repeat_failure: isRepeat,
    });
  }

  // Sort work orders chronologically
  workOrders.sort((a, b) => a.date.localeCompare(b.date));

  return { vehicles, workOrders };
}
