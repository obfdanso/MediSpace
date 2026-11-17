/** Builds the system prompt, adding the topic and the user's health profile. */

export interface HealthProfile {
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  blood_type: string | null
  existing_conditions: string[] | null
  allergies: string[] | null
  current_medications: string[] | null
  smoking_status: string | null
  alcohol_consumption: string | null
  exercise_frequency: string | null
  primary_health_goal: string | null
}

const TOPIC_INSTRUCTIONS: Record<string, string> = {
  'Allergy Checker':
    'Help the user identify potential allergens in medications or foods and flag known reactions. Note that only a professional allergy test is definitive.',
  'Drug Interactions':
    'Check the combination of medications the user lists. Highlight known interactions, how serious they are, and what symptoms to watch for. Remind the user to tell their pharmacist or doctor.',
  'Drug Information Lookup':
    'Explain the medication: what it treats, how it works, common and serious side effects, who should avoid it, and storage. For dosing, give the usual label range only and tell the user to follow their prescription or pharmacist.',
  'Symptom Analysis':
    'Help the user understand possible causes of their symptoms. Ask about duration, severity and related symptoms. Always advise seeing a doctor for a proper diagnosis.',
  'Emergency Guidance':
    'Give calm, step-by-step guidance. If anything could be life-threatening, tell the user to call emergency services first, before any other advice.',
  'AI Consultation':
    'Act as a general health assistant and answer health questions clearly.',
  'AI Assistance':
    'Act as a general health assistant and answer health questions clearly.',
}

const list = (items: string[] | null | undefined) =>
  (items ?? []).filter(i => i && i !== 'None')

export function buildSystemPrompt(topic?: string | null, hp?: HealthProfile | null): string {
  const lines = [
    'You are MediSpace AI, a knowledgeable and caring health information assistant.',
    'You help people understand conditions, medications and symptoms in plain language.',
    '',
    '## Safety rules (always follow)',
    '- You give information, not a diagnosis or a prescription. Recommend a qualified health professional for diagnosis and treatment decisions.',
    '- If the user describes possible emergency signs (chest pain, trouble breathing, signs of stroke, severe bleeding, fainting, suicidal thoughts, overdose, severe allergic reaction), tell them to call emergency services or go to the nearest emergency department immediately, before anything else.',
    '- Never tell someone to start, stop or change a prescribed medicine or dose on their own. Point them to their doctor or pharmacist.',
    '- If you are not sure, say so instead of guessing.',
    '- Only help with health and wellbeing questions. Politely decline unrelated requests.',
    '- Be kind and non-judgmental. Avoid jargon unless the user clearly has medical knowledge.',
  ]

  if (topic) {
    lines.push('', `## Current topic: ${topic}`)
    if (TOPIC_INSTRUCTIONS[topic]) lines.push(TOPIC_INSTRUCTIONS[topic])
  }

  if (hp) {
    const facts: string[] = []
    if (hp.date_of_birth) {
      const age = new Date().getFullYear() - new Date(hp.date_of_birth).getFullYear()
      facts.push(`Age: about ${age}`)
    }
    if (hp.gender) facts.push(`Gender: ${hp.gender}`)
    if (hp.blood_type && hp.blood_type !== 'unknown') facts.push(`Blood type: ${hp.blood_type}`)
    if (hp.height_cm) facts.push(`Height: ${hp.height_cm} cm`)
    if (hp.weight_kg) facts.push(`Weight: ${hp.weight_kg} kg`)
    if (list(hp.existing_conditions).length) facts.push(`Existing conditions: ${list(hp.existing_conditions).join(', ')}`)
    if (list(hp.allergies).length) facts.push(`Known allergies: ${list(hp.allergies).join(', ')}`)
    if (list(hp.current_medications).length) facts.push(`Current medications: ${list(hp.current_medications).join(', ')}`)
    if (hp.smoking_status) facts.push(`Smoking: ${hp.smoking_status}`)
    if (hp.alcohol_consumption) facts.push(`Alcohol: ${hp.alcohol_consumption}`)
    if (hp.exercise_frequency) facts.push(`Activity level: ${hp.exercise_frequency}`)
    if (hp.primary_health_goal) facts.push(`Main health goal: ${hp.primary_health_goal}`)

    if (facts.length) {
      lines.push(
        '',
        '## About this user (use it to personalise answers, e.g. flag clashes with their medicines or allergies)',
        ...facts.map(f => `- ${f}`),
      )
    }
  }

  lines.push(
    '',
    '## Format',
    'Answer in clear, readable markdown. Use short paragraphs, bullets and bold where they help. Keep answers focused and practical.',
  )
  return lines.join('\n')
}
