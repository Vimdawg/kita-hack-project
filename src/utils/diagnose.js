/**
 * Simulated crop disease diagnosis engine.
 *
 * In production, this would load a real TensorFlow.js model from IndexedDB
 * and run inference on the image tensor. For the hackathon demo, we return
 * realistic mock predictions so the full UI/UX pipeline can be tested.
 *
 * The API surface is identical — swap `runDiagnosis` internals for real
 * inference with zero changes to any consuming component.
 */

const DISEASE_DATABASE = {
  'oil-palm': [
    {
      disease: 'Basal Stem Rot (Ganoderma)',
      confidence: 0.92,
      severity: 'high',
      description:
        'Fungal infection caused by Ganoderma boninense. Affects the base of the trunk, causing internal tissue decay.',
      actions: [
        'Remove and destroy infected palms immediately',
        'Apply Trichoderma-based biocontrol agents to surrounding soil',
        'Create sanitation trenches around affected area',
        'Avoid replanting in the same spot for 2 seasons',
        'Report to MARDI extension officer for regional tracking',
      ],
    },
    {
      disease: 'Leaf Spot Disease',
      confidence: 0.78,
      severity: 'medium',
      description:
        'Cercospora leaf spots appear as small dark lesions on fronds. Common in humid conditions.',
      actions: [
        'Remove heavily affected fronds during pruning',
        'Improve canopy spacing for better airflow',
        'Apply copper-based fungicide if outbreak is severe',
        'Monitor during wet season for recurrence',
      ],
    },
    {
      disease: 'Healthy',
      confidence: 0.95,
      severity: 'none',
      description: 'No disease detected. Your oil palm appears to be in healthy condition.',
      actions: [
        'Continue regular maintenance schedule',
        'Monitor for early signs of disease weekly',
        'Ensure proper fertilization and drainage',
      ],
    },
  ],
  paddy: [
    {
      disease: 'Rice Blast (Pyricularia oryzae)',
      confidence: 0.88,
      severity: 'high',
      description:
        'Fungal disease causing diamond-shaped lesions on leaves. Can devastate yield if untreated.',
      actions: [
        'Apply Tricyclazole or Isoprothiolane fungicide',
        'Reduce nitrogen fertilizer application',
        'Drain field water to reduce humidity',
        'Plant resistant varieties (MR219, MR220) next season',
        'Report to local MARDI lab for confirmation',
      ],
    },
    {
      disease: 'Bacterial Leaf Blight',
      confidence: 0.82,
      severity: 'medium',
      description:
        'Xanthomonas oryzae infection causing yellowish streaks on leaves. Spreads rapidly in wet conditions.',
      actions: [
        'Drain excess water from paddy fields',
        'Avoid excessive nitrogen fertilizer',
        'Use copper hydroxide sprays to control spread',
        'Ensure proper seed treatment for next planting',
      ],
    },
    {
      disease: 'Healthy',
      confidence: 0.96,
      severity: 'none',
      description: 'No disease detected. Your paddy crop appears to be in excellent condition.',
      actions: [
        'Continue regular water management',
        'Monitor for signs of pest infestation',
        'Follow scheduled fertilizer application',
      ],
    },
  ],
  rubber: [
    {
      disease: 'Corynespora Leaf Fall',
      confidence: 0.85,
      severity: 'high',
      description:
        'Aggressive fungal disease causing premature leaf fall, significantly reducing latex yield.',
      actions: [
        'Apply hexaconazole-based fungicide via fogging',
        'Remove and burn fallen infected leaves',
        'Ensure tapping is paused during severe outbreaks',
        'Consider replanting with RRIM 3001 (resistant clone)',
      ],
    },
    {
      disease: 'Powdery Mildew',
      confidence: 0.75,
      severity: 'medium',
      description:
        'White powdery patches on young leaves. Most common during refoliation season.',
      actions: [
        'Apply sulfur-based fungicide during refoliation',
        'Monitor weather patterns for optimal spray timing',
        'Ensure adequate spacing between trees',
      ],
    },
    {
      disease: 'Healthy',
      confidence: 0.93,
      severity: 'none',
      description: 'No disease detected. Your rubber trees appear healthy.',
      actions: [
        'Continue regular tapping schedule',
        'Monitor for Corynespora during wet season',
        'Apply recommended fertilizer regime',
      ],
    },
  ],
  cocoa: [
    {
      disease: 'Black Pod Rot (Phytophthora)',
      confidence: 0.89,
      severity: 'high',
      description:
        'Phytophthora palmivora infection causing dark, spreading lesions on pods. Major cause of cocoa yield loss.',
      actions: [
        'Remove and destroy infected pods immediately',
        'Apply copper-based fungicide to remaining pods',
        'Improve drainage around cocoa trees',
        'Increase harvesting frequency to remove pods before infection',
        'Prune canopy to improve air circulation',
      ],
    },
    {
      disease: 'Vascular Streak Dieback (VSD)',
      confidence: 0.76,
      severity: 'medium',
      description:
        'Oncobasidium theobromae causing leaf chlorosis and branch dieback. Internal vascular streaking visible when branches are cut.',
      actions: [
        'Prune infected branches 30cm below visible symptoms',
        'Apply wound paint after pruning',
        'Improve canopy management for airflow',
        'Use VSD-tolerant planting material',
      ],
    },
    {
      disease: 'Healthy',
      confidence: 0.94,
      severity: 'none',
      description: 'No disease detected. Your cocoa trees appear to be in good health.',
      actions: [
        'Continue regular harvesting and pruning',
        'Monitor pods weekly for early signs of disease',
        'Maintain shade canopy at optimal 50-60%',
      ],
    },
  ],
}

/**
 * Run diagnosis on a crop image.
 * @param {string} cropType - One of: 'oil-palm', 'paddy', 'rubber', 'cocoa'
 * @param {File} imageFile - The uploaded image (used for future real inference)
 * @returns {{ disease, confidence, severity, description, actions[] }}
 */
export function runDiagnosis(cropType, imageFile) {
  const diseases = DISEASE_DATABASE[cropType]
  if (!diseases) {
    return {
      disease: 'Unknown',
      confidence: 0,
      severity: 'unknown',
      description: 'Unsupported crop type.',
      actions: ['Please select a supported crop type.'],
    }
  }

  // For demo: weighted random — 60% disease, 40% healthy
  const rand = Math.random()
  let result
  if (rand < 0.4) {
    result = diseases.find((d) => d.severity === 'none')
  } else if (rand < 0.75) {
    result = diseases.find((d) => d.severity === 'high')
  } else {
    result = diseases.find((d) => d.severity === 'medium')
  }

  // Add slight randomness to confidence
  const confidenceJitter = (Math.random() - 0.5) * 0.1
  return {
    ...result,
    confidence: Math.min(0.99, Math.max(0.6, result.confidence + confidenceJitter)),
    timestamp: new Date().toISOString(),
    cropType,
  }
}
