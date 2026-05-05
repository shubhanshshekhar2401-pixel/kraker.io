import { AIClassification, QuestionnaireState, DiagnosisResult, CrackKind, CrackPattern, CrackSeverity, LocationType, SurfaceType } from './types';

export async function getAIClassification(imageFile: File | string): Promise<AIClassification> {
  if (typeof imageFile === 'string') {
    // Return mock for asset strings if needed
    return {
      kind: CrackKind.Thermal,
      pattern: CrackPattern.Network,
      severity: CrackSeverity.Moderate,
      surface: SurfaceType.Wall as any
    };
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  // IMPORTANT:
  // Backend endpoint is /predict, not root (/)
  // Using Render production URL
  const API_URL = "https://kraker-backend.onrender.com/predict";

  try {
    console.log(`[Diagnostic] Initiating transmission to: ${API_URL}`);
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Diagnostic] Server returned error status:", response.status, errorText);
      throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 50)}`);
    }

    const data = await response.json();
    console.log("[Diagnostic] Successful AI Inference:", data);

    // Handle no crack detected
    if (data.status === "no_crack") {
      return {
        kind: CrackKind.Crazing, // Placeholder
        pattern: CrackPattern.Network,
        severity: CrackSeverity.Minor,
        no_crack: true,
        message: data.message || "No crack detected."
      } as any;
    }

    const typeMapping: Record<string, CrackKind> = {
      'structural': CrackKind.Structural,
      'thermal': CrackKind.Thermal,
      'shrinkage': CrackKind.Shrinkage,
      'crazing': CrackKind.Crazing
    };

    return {
      kind: typeMapping[data.type] || CrackKind.Structural,
      pattern: CrackPattern.Linear, // Pattern detection might be a future backend feature
      severity: data.confidence > 80 ? CrackSeverity.Severe : (data.confidence > 50 ? CrackSeverity.Moderate : CrackSeverity.Minor),
      surface: SurfaceType.Wall, // Default surface
      confidence_score: data.confidence,
      cause: data.cause,
      fix: data.fix
    } as any;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    throw new Error("Connection failed. Ensure backend at Render is active.");
  }
}

export function generateDiagnosis(ai: AIClassification, quest: QuestionnaireState): DiagnosisResult {
  const answers = quest.answers;
  const { location } = quest;
  
  // ⚠️ FIX STRUCTURAL LOGIC (CRITICAL)
  // Structural is triggered ONLY IF:
  // - severity == "severe"
  // - OR (increasing == true AND location == "Beam" OR "Column")
  // - OR widening == true
  const isIncreasing = answers.increasing === true;
  const isWidening = answers.widening === true;
  const isSevere = ai.severity === CrackSeverity.Severe;
  const isBeamOrColumn = location === LocationType.Beam || location === LocationType.Column;

  const isStructuralTrigger = isSevere || (isIncreasing && isBeamOrColumn) || isWidening;

  // Environmental Context
  const isHighTemp = answers.highTemp === true || answers.sunExposure === true;
  const isMoist = answers.dampness === true || answers.leakage === true || answers.waterAccumulation === true;
  const isNew = answers.age === '<1 Year' || answers.newConstruction === true;
  const poorCuring = answers.properCuring === false;

  // Potential Classifications
  let type = '';
  let confidence: 'High' | 'Medium' | 'Low' = 'Low';
  let risk_level: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  let root_cause_base = '';
  let override_reason = '';

  // 1. Structural Logic (Highest Priority)
  if (isStructuralTrigger) {
    type = 'Structural';
    root_cause_base = `Critical structural integrity issue identified for this ${location}. The observed ${ai.pattern} pattern indicates mechanical failure thresholds have been reached, likely due to overload or secondary structural movement.`;
  } 
  // 2. Thermal Logic
  else if (isHighTemp && (ai.pattern === CrackPattern.Network || ai.pattern === CrackPattern.Random)) {
    type = 'Thermal';
    root_cause_base = `Significant thermal expansion stresses on the ${location} surface. Temperature-driven volumetric changes have exceeded the material's elastic limit.`;
  }
  // 3. Shrinkage Logic
  else if (isNew && (poorCuring || ai.pattern === CrackPattern.Map || ai.pattern === CrackPattern.Linear)) {
    type = 'Shrinkage';
    root_cause_base = `Classic drying shrinkage identified. Sub-optimal curing or rapid moisture loss in the early-stage ${location} matrix has caused volumetric contraction.`;
  }
  // 4. Crazing Logic
  else if (ai.pattern === CrackPattern.Network && (ai.severity === CrackSeverity.Minor || ai.severity === CrackSeverity.Moderate) && !isIncreasing) {
    type = 'Crazing';
    root_cause_base = `Surface-level map cracking (crazing) on the ${location}. This is typically non-structural and localized to the paste-rich surface layer.`;
  }
  // Fallback to AI Classification if no specific triggers
  else {
    type = ai.kind.charAt(0).toUpperCase() + ai.kind.slice(1);
    root_cause_base = `Visual diagnostics align with ${ai.kind} behavior within the ${location} domain, based on primary architectural pattern recognition.`;
  }

  // 🧠 ROOT CAUSE ENGINE UPGRADE (Combine patterns, environment, and behavior)
  const patternDesc = `${ai.pattern} pattern`;
  const envDesc = isHighTemp ? "extreme thermal conditions" : (isMoist ? "active moisture presence" : "standard environmental factors");
  const behaviorDesc = isWidening ? "active widening" : (isIncreasing ? "dynamic growth" : "stable state");
  
  const root_cause = `${root_cause_base} Analysis reveals a ${patternDesc} combined with ${envDesc} and ${behaviorDesc} profile.`;

  // 🚨 RISK LEVEL SYSTEM
  if (isSevere || isWidening || (type === 'Structural' && isIncreasing)) {
    risk_level = 'Critical';
  } else if (type === 'Structural') {
    risk_level = 'High';
  } else if (isIncreasing) {
    // Non-structural but growing
    risk_level = type === 'Thermal' || type === 'Shrinkage' ? 'Moderate' : 'High';
    if (ai.severity === CrackSeverity.Severe) risk_level = 'High';
  } else if (ai.severity === CrackSeverity.Moderate) {
    risk_level = 'Moderate';
  } else {
    risk_level = 'Low';
  }

  // ⚠️ ADD OVERRIDE EXPLANATION (MANDATORY)
  const aiKindFormatted = ai.kind.charAt(0).toUpperCase() + ai.kind.slice(1);
  if (aiKindFormatted !== type) {
    if (type === 'Structural') {
      override_reason = `AI classification suggested ${aiKindFormatted} due to visual pattern similarity. However, ${isIncreasing ? 'ongoing growth in a structural element' : (isWidening ? 'active widening' : 'severe depth')} indicates a priority structural risk override.`;
    } else {
      override_reason = `AI classification suggested ${aiKindFormatted}. Contextual data for ${type} triggered based on environmental factors (${isHighTemp ? 'heat' : 'moisture'}) and construction age.`;
    }
  }

  // Confidence Calculation
  if (aiKindFormatted === type && (isStructuralTrigger || isHighTemp)) {
    confidence = 'High';
  } else if (aiKindFormatted === type || type !== 'Unknown') {
    confidence = 'Medium';
  } else {
    confidence = 'Low';
  }

  // 📊 ENHANCED ACTION PLAN LOGIC
  const isShallow = ai.severity === CrackSeverity.Minor && !isWidening;
  const isWidespread = ai.pattern === CrackPattern.Network || ai.pattern === CrackPattern.Map || isIncreasing;
  
  let action_plan = {
    immediate: "",
    repair: "",
    prevention: ""
  };

  if (type === 'Structural') {
    if (isBeamOrColumn) {
      action_plan.immediate = `Method: Temporary Shoring. Material: Steel Acrow props. Reason: Stabilize the ${location} immediately by redistributing dead and live loads away from the compromised section to prevent catastrophic failure while under ${behaviorDesc}.`;
      action_plan.repair = `Method: Structural Reinforcement. Material: Carbon Fiber Reinforced Polymer (CFRP) wrapping or Steel Plates. Reason: Restore tensile strength to the ${location} matrix and prevent further ${behaviorDesc} under cyclic loading.`;
      action_plan.prevention = `Method: Load Redistribution. Material: New structural supports or composite beams. Reason: Permanently reduce the stress intensity factor on the member to accommodate current ${envDesc}.`;
    } else if (location === LocationType.Slab || location === LocationType.Floor) {
      action_plan.immediate = `Method: Load Restriction. Material: Cautionary barriers. Reason: Immediately restrict all weight or traffic on the ${location} to prevent deflection-induced collapse while the structural state is ${behaviorDesc}.`;
      action_plan.repair = `Method: Sectional Strengthening. Material: Steel channel reinforcement or epoxy pressure injection. Reason: Restore the load-bearing capacity of the ${location} and bridge the shear/tensile failure points across the ${patternDesc}.`;
      action_plan.prevention = `Method: Stress Relief Joints. Material: Saw-cut control joints or carbon fiber stitches. Reason: Provide controlled movement paths to manage the stresses that led to the ${behaviorDesc} in the ${location}.`;
    } else {
      action_plan.immediate = `Method: Cordon & Clear. Material: Barrier tape/signage. Reason: Prevent safety hazards in the proximity of the compromised ${location}. If the crack is verified as active (${behaviorDesc}), avoid any dynamic loading on upper floors.`;
      action_plan.repair = `Method: Stitching & Injection. Material: Steel staples + Structural Epoxy. Reason: Mechanically bridge the crack using staples (crack stitching) to resist further movement while the epoxy restores monolithic behavior of the concrete.`;
      action_plan.prevention = `Method: Foundation/Drainage Stabilization. Material: Chemical underpinning or improved drainage systems. Reason: Address the likely root cause of structural shifting or settlement often exacerbated by ${envDesc}.`;
    }
  } else if (type === 'Thermal') {
    action_plan.immediate = `Method: Expansion Relief Assessment. Material: Digital calipers/gauges. Reason: Monitor the ${behaviorDesc} relative to ${envDesc} to determine if movement is cyclical before committing to a permanent seal.`;
    if (isShallow) {
      action_plan.repair = `Method: Surface Sealing. Material: Semi-rigid flexible sealant (Polysulfide). Reason: Accommodate the thermal movement of the surface while preventing moisture ingress in this ${isShallow ? 'minor' : 'moderate'} crack.`;
    } else {
      action_plan.repair = `Method: Flexible Joint Restoration. Material: Polyurethane expansion joint sealant. Reason: Provide a high-movement capacity seal that handles the stress concentrated in the ${location} by ${envDesc}.`;
    }
    action_plan.prevention = `Method: Thermal Shielding. Material: Solar reflective elastomer coating. Reason: Reduce the surface peak temperature by up to 20°C, lowering the thermal expansion delta that drives ${behaviorDesc} in this ${location}.`;
  } else if (type === 'Shrinkage') {
    action_plan.immediate = `Method: Hydration Control. Material: Saturated burlap/hessian. Reason: Arrest any further drying of the ${location} matrix if the material is still in a mature curing phase.`;
    action_plan.repair = `Method: Penetrative Grouting. Material: Polymer-modified non-shrink grout. Reason: Fill the ${patternDesc} voids to restore surface integrity and prevent air/water ingress into the ${location}.`;
    action_plan.prevention = `Method: Improved Curing Regimen. Material: Liquid membrane-forming curing compound. Reason: Ensure uniform moisture retention across the ${location} to prevent differential drying stresses in future pours or overlays.`;
  } else {
    action_plan.immediate = `Method: Visual Monitoring. Material: Reference photography/marking. Reason: Establish a baseline for the existing ${patternDesc} to ensure it remains a ${behaviorDesc} and does not progress to structural significance.`;
    action_plan.repair = `Method: Cosmetic Resurfacing. Material: Thin-set cementitious overlay. Reason: Improve the aesthetic quality of the ${location} surface and seal micro-cracks before they accumulate debris.`;
    action_plan.prevention = `Method: Surface Maintenance. Material: Silane/Siloxane sealer. Reason: Hydrophobic protection to reduce the impact of ${envDesc} on the surface layer of the ${location}.`;
  }

  // Conditional Add-ons
  if (isWidespread && type !== 'Structural') {
    action_plan.prevention += ` Note: Due to the ${patternDesc} and ${behaviorDesc}, consider introducing formal control joints to localize future stresses.`;
  }

  return { 
    type, 
    confidence, 
    risk_level, 
    root_cause, 
    override_reason: override_reason || undefined,
    action_plan 
  };
}
