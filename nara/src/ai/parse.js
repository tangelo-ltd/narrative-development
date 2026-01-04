export function parseJsonFromOutput(output) {
  const trimmed = output.trim();
  if (!trimmed) {
    throw new Error('AI output was empty');
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error('AI output was not valid JSON');
  }
}
