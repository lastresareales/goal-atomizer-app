/**
 * Calculates overall progress across all phases.
 * @param {string[]} phaseOrder - Ordered array of phase names
 * @param {Object} phases - Map of phase name -> steps array
 * @returns {{ totalDone: number, totalSteps: number, overallPct: number }}
 */
export function calculateProgress(phaseOrder, phases) {
  const allSteps = phaseOrder.flatMap((p) => phases[p] || []);
  const totalDone = allSteps.filter((s) => s.done).length;
  const totalSteps = allSteps.length;
  const overallPct = totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0;
  return { totalDone, totalSteps, overallPct };
}

/**
 * Finds the index of the first phase that still has incomplete steps.
 * Falls back to the last phase index if all are complete.
 * @param {string[]} phaseOrder
 * @param {Object} phases
 * @returns {number}
 */
export function findActivePhase(phaseOrder, phases) {
  for (let i = 0; i < phaseOrder.length; i++) {
    const ph = phases[phaseOrder[i]] || [];
    if (ph.some((s) => !s.done)) return i;
  }
  return phaseOrder.length > 0 ? phaseOrder.length - 1 : 0;
}

/**
 * Generates a Markdown string representing the current goal plan.
 * @param {string} goal
 * @param {string} quote
 * @param {string[]} phaseOrder
 * @param {Object} phases
 * @returns {string}
 */
export function generateMarkdown(goal, quote, phaseOrder, phases) {
  let md = `# Goal: ${goal}\n> *${quote}*\n\n`;
  phaseOrder.forEach((phaseName, i) => {
    md += `## Phase ${i + 1}: ${phaseName}\n`;
    (phases[phaseName] || []).forEach((step) => {
      md += `- [${step.done ? "x" : " "}] ${step.text} *(⏱ ${step.time})*\n`;
      if (step.note) md += `  - *Note: ${step.note}*\n`;
    });
    md += `\n`;
  });
  return md;
}
