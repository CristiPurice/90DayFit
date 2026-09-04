import type { WeekMetrics } from './progress'
import { formatInt, formatKg } from './format'

/** Cele 10 întrebări ale evaluării de duminică. */
export const REVIEW_QUESTIONS: string[] = [
  'Care este media greutății din această săptămână față de cea anterioară?',
  'Cât a scăzut sau a crescut talia față de ultima măsurătoare?',
  'Câte din cele 21 de mese au fost conform planului? (Ținta: 18+)',
  'Am făcut toate cele 3 antrenamente? Dacă nu, de ce?',
  'Am adăugat repetări sau greutate la cel puțin 2 exerciții?',
  'Care a fost media pașilor?',
  'Câte nopți am dormit sub 5 ore?',
  'A dat lombara vreun semn? La ce exercițiu?',
  'Tensiunea este în intervalul obișnuit?',
  'Ce anume a fost cel mai greu săptămâna asta și ce schimb concret pentru săptămâna viitoare?',
]

export type Severity = 'ok' | 'adjust' | 'alert'

export interface Decision {
  severity: Severity
  decision: string
  reason: string
}

function signed(kg: number): string {
  const s = formatKg(Math.abs(kg))
  return kg < 0 ? `−${s}` : kg > 0 ? `+${s}` : s
}

/** Regulile de ajustare din plan, aplicate pe cifrele săptămânii curente și ale celei anterioare. */
export function weeklyDecision(m: WeekMetrics, prev?: WeekMetrics): Decision {
  if (m.highBpDays30 >= 3) {
    return {
      severity: 'alert',
      decision: 'Consult medical înainte de a continua',
      reason: `Tensiune peste 140/90 în ${m.highBpDays30} zile din ultimele 30.`,
    }
  }
  if (m.weekNo <= 2) {
    return { severity: 'ok', decision: 'Nimic', reason: 'Săptămânile 1–2 sunt de referință: scăderea e mai ales apă.' }
  }
  if (m.rateKg === null) {
    return { severity: 'ok', decision: 'Nimic încă', reason: 'Lipsesc cântăriri pentru a compara mediile. Cântărește-te zilnic.' }
  }
  const loss = -m.rateKg
  const prevLoss = prev?.rateKg === null || prev?.rateKg === undefined ? null : -prev.rateKg

  if (m.strengthTrend === 'down' && prev?.strengthTrend === 'down') {
    return {
      severity: 'adjust',
      decision: '+150 kcal, verifică proteinele și somnul',
      reason: 'Volumul din sală scade a doua săptămână la rând: semn de pierdere musculară.',
    }
  }
  if (loss > 1.5 && prevLoss !== null && prevLoss > 1.5) {
    return {
      severity: 'adjust',
      decision: '+150 kcal',
      reason: `Scădere de ${formatKg(loss)} kg, a doua săptămână peste 1,5 kg. Prea repede pentru a proteja mușchii.`,
    }
  }
  if (loss >= 0.8 && loss <= 1.3) {
    return { severity: 'ok', decision: 'Nimic', reason: `Ritm ${signed(m.rateKg)} kg/săptămână, exact în interval. Plan corect.` }
  }
  if (loss < 0.5) {
    if (m.waistCm !== null && m.waistPrevCm !== null && m.waistPrevCm - m.waistCm >= 1) {
      return {
        severity: 'ok',
        decision: 'Nimic',
        reason: `Cântarul stagnează, dar talia a scăzut cu ${formatKg(m.waistPrevCm - m.waistCm)} cm. Pierzi grăsime, păstrezi mușchi.`,
      }
    }
    if (m.mealsFollowed < 15) {
      return {
        severity: 'adjust',
        decision: 'Nu tăia calorii. Rezolvă aderența.',
        reason: `Doar ${m.mealsFollowed} din 21 de mese conform planului. Întâi mesele, apoi cifrele.`,
      }
    }
    if (prevLoss !== null && prevLoss < 0.5) {
      return {
        severity: 'adjust',
        decision: '−150 kcal sau +1.500 pași/zi (alege una)',
        reason: `Sub 0,5 kg două săptămâni la rând, cu ${m.mealsFollowed} mese conforme.`,
      }
    }
    return { severity: 'ok', decision: 'Nimic', reason: 'O singură săptămână sub 0,5 kg nu decide. Așteaptă încă una.' }
  }
  return { severity: 'ok', decision: 'Nimic', reason: `Ritm ${signed(m.rateKg)} kg/săptămână, în marja normală.` }
}

/** Răspunsuri precompletate din date pentru întrebările măsurabile; celelalte rămân goale. */
export function prefillAnswers(m: WeekMetrics): string[] {
  const a: string[] = Array.from({ length: REVIEW_QUESTIONS.length }, () => '')
  a[0] =
    m.avgKg === null
      ? 'Fără cântăriri săptămâna asta.'
      : m.prevAvgKg === null
        ? `Media ${formatKg(m.avgKg)} kg (${m.weighIns} cântăriri). Fără săptămână anterioară.`
        : `Media ${formatKg(m.avgKg)} kg față de ${formatKg(m.prevAvgKg)} kg: ${signed(m.rateKg ?? 0)} kg.`
  a[1] =
    m.waistCm === null
      ? 'Nemăsurată.'
      : m.waistPrevCm === null
        ? `Talie ${formatKg(m.waistCm)} cm.`
        : `Talie ${formatKg(m.waistCm)} cm, ${signed(m.waistCm - m.waistPrevCm)} cm față de ultima măsurătoare.`
  a[2] = `${m.mealsFollowed} din ${m.mealsTotal}.`
  a[3] = `${m.workoutsDone} din 3 antrenamente încheiate.`
  a[4] =
    m.strengthTrend === null
      ? 'Nu se poate compara încă volumul.'
      : `Volum ${formatInt(m.volumeKg)} kg față de ${formatInt(m.prevVolumeKg)} kg (${m.strengthTrend === 'up' ? 'în creștere' : m.strengthTrend === 'down' ? 'în scădere' : 'constant'}).`
  a[5] = m.avgSteps === null ? 'Fără pași notați.' : `${formatInt(m.avgSteps)} pași/zi, țintă ${formatInt(m.stepTarget)}.`
  a[6] = `${m.nightsUnder5} nopți sub 5 ore (din cele notate la sală).`
  a[8] = m.highBpDays30 === 0 ? 'Da, nicio zi peste 140/90 în ultimele 30.' : `${m.highBpDays30} zile peste 140/90 în ultimele 30.`
  return a
}
