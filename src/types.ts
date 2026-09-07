export type DutyClass = 'Ultra-Heavy' | 'Heavy' | 'Standard' | 'Severe-Haul';
export type VehicleType = 'Haul Truck' | 'Hydraulic Excavator' | 'Wheel Loader' | 'Track Dozer' | 'Drill Rig';
export type ShiftType = 'Day (06:00-18:00)' | 'Night (18:00-06:00)';
export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Vehicle {
  vehicle_id: string;
  vehicle_type: VehicleType;
  manufacturer: string;
  model: string;
  age_years: number;
  site: string;
  duty_class: DutyClass;
  operating_hours: number;
  load_profile: 'Standard Payload' | 'High Payload (+15%)' | 'Extreme Overload (+25%)';
  shift_pattern: 'Continuous 24/7' | 'Two Shifts' | 'Day Only';
  status: 'In Service' | 'Under Maintenance' | 'Restricted Duty';
}

export interface WorkOrder {
  work_order_id: string;
  vehicle_id: string;
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  failure_category: 'Engine' | 'Hydraulics' | 'Braking' | 'Electrical/Drive' | 'Structural/Chassis';
  symptom: string;
  fault_code: string;
  fault_code_desc: string;
  severity: SeverityLevel;
  downtime_hours: number;
  repair_action: string;
  technician: string;
  replaced_part: string;
  part_id: string;
  repair_duration: number; // hours
  operating_hours_at_failure: number;
  environmental_condition: string; // e.g. "High Dust", "Extreme Ambient Heat (44C)", "Wet / Muddy"
  load_condition: string; // e.g. "High Payload (240t)", "Full Capacity"
  terrain_condition: string; // e.g. "Steep Haul Ramp (12% grade)", "Corrugated Pit Floor"
  recurrence_count: number;
  previous_work_order_id?: string;
  true_root_cause?: string; // Ground truth label for synthetic validation
  is_repeat_failure?: boolean;
}

export interface RepeatFailureCase {
  case_id: string;
  vehicle_id: string;
  vehicle_type: VehicleType;
  model: string;
  site: string;
  first_detected_date: string;
  latest_work_order_id: string;
  failure_category: string;
  primary_symptom: string;
  recurrence_count: number;
  total_downtime_hours: number;
  time_window_days: number;
  work_order_ids: string[];
  fault_codes: string[];
  replaced_parts: string[];
  operating_conditions: string[];
  previous_repairs: string[];
  
  // Root cause analysis output
  top_root_cause: string;
  confidence_score: number; // 0 - 100
  score_breakdown: {
    fault_code_consistency: number;
    recurrence_strength: number;
    part_relationship: number;
    operating_condition_relationship: number;
    symptom_consistency: number;
    temporal_consistency: number;
  };
  evidence_summary: string[];
  symptom_fix: string;
  recommended_permanent_action: string;
  expected_recurrence_reduction: number; // e.g. 78%
  
  // Current active plan & override status
  current_plan: string;
  status: 'Open' | 'Investigating' | 'Overridden' | 'Action Scheduled' | 'Resolved';
  has_override: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Vehicle' | 'WorkOrder' | 'Symptom' | 'FaultCode' | 'Part' | 'OperatingCondition' | 'RootCause' | 'Action';
  category?: string;
  details?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  confidence?: number;
  evidence_count?: number;
  date?: string;
  source_work_order?: string;
}

export interface CaseGraphData {
  case_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PlanChangeRecord {
  change_id: string;
  case_id: string;
  vehicle_id: string;
  timestamp: string;
  user_role: 'Maintenance Technician' | 'Maintenance Planner' | 'Dispatcher' | 'Reliability Engineer';
  user_name: string;
  previous_plan: string;
  new_plan: string;
  reason: string;
  override_flag: boolean;
  system_recommendation: string;
  dispatcher_decision: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ProvenanceChain {
  case_id: string;
  root_cause: string;
  confidence: number;
  evidence_work_orders: Array<{
    work_order_id: string;
    date: string;
    symptom: string;
    fault_code: string;
    repair_action: string;
    replaced_part: string;
    operating_conditions: string;
    downtime_hours: number;
  }>;
  fault_code_evidence: Array<{
    code: string;
    count: number;
    description: string;
  }>;
  part_evidence: Array<{
    part_name: string;
    part_id: string;
    replacement_count: number;
  }>;
  operating_condition_evidence: Array<{
    condition: string;
    association_strength: number;
  }>;
  recurrence_rate: {
    total_events: number;
    interval_days: number;
    avg_days_between_failure: number;
  };
}

export interface EdgeTestCaseResult {
  id: string;
  name: string;
  description: string;
  input_scenario: string;
  expected_outcome: string;
  actual_outcome: string;
  status: 'PASS' | 'FAIL';
  evidence_verified: boolean;
  timestamp: string;
  details: string;
}

export interface ExperimentMetrics {
  metric: string;
  baseline: string;
  target: string;
  measured: string;
  improvement: string;
  status: 'Exceeded' | 'Achieved' | 'Target Met';
}
