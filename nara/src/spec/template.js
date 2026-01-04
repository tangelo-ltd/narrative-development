/**
 * Story template rendering.
 */

/**
 * Default story template.
 */
const STORY_TEMPLATE = `## ID

story.{{subsystem}}.{{verb}}

## Type

{{storyType}}

## Purpose

{{purpose}}

## Inputs

{{inputs}}

## Outputs

{{outputs}}

## Behavior

{{behavior}}

## Existing Implementation

{{existingImplementation}}

## As Implemented

{{asImplemented}}

## Intended Behavior

{{intendedBehavior}}

## Constraints

{{constraints}}

## Errors

{{errors}}

## Dependencies

{{dependencies}}

## Tests

{{tests}}

## Open Questions

{{openQuestions}}
`;

/**
 * Default values for template variables.
 */
const DEFAULTS = {
  storyType: 'operation',
  purpose: '(One sentence: what does this operation do?)',
  inputs: '- (parameter): (type) — (description)',
  outputs: '- (return): (type) — (description)',
  behavior: '1. (Step one)\n2. (Step two)\n3. (Step three)',
  existingImplementation: 'Paths:\n- (path)\n\nNotes:\n- (notes)',
  asImplemented: '(Describe current behavior as implemented)',
  intendedBehavior: '(Describe desired behavior if different from current)',
  constraints: '- (Any limits, invariants, or preconditions)',
  errors: '- (ErrorName): when (condition)',
  dependencies: '(None)',
  tests: `### Happy path
- Given: (setup)
- When: (action)
- Then: (expected result)

### Error case
- Given: (setup for error)
- When: (action)
- Then: (expected error)`,
  openQuestions: '- Q1: (unresolved question)',
};

/**
 * Render a story template with the given variables.
 * @param {object} vars - Template variables
 * @param {string} vars.subsystem - Subsystem name
 * @param {string} vars.verb - Verb name
 * @param {string} [vars.storyType] - Story type
 * @param {string} [vars.purpose] - Purpose description
 * @param {string} [vars.inputs] - Inputs section
 * @param {string} [vars.outputs] - Outputs section
 * @param {string} [vars.behavior] - Behavior section
 * @param {string} [vars.existingImplementation] - Existing implementation section
 * @param {string} [vars.asImplemented] - As Implemented section
 * @param {string} [vars.intendedBehavior] - Intended Behavior section
 * @param {string} [vars.constraints] - Constraints section
 * @param {string} [vars.errors] - Errors section
 * @param {string} [vars.dependencies] - Dependencies section
 * @param {string} [vars.tests] - Tests section
 * @param {string} [vars.openQuestions] - Open questions section
 * @returns {string} - Rendered template
 */
export function renderStoryTemplate(vars) {
  let result = STORY_TEMPLATE;

  // Required vars
  result = result.replace(/\{\{subsystem\}\}/g, vars.subsystem);
  result = result.replace(/\{\{verb\}\}/g, vars.verb);

  // Optional vars with defaults
  for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
    const value = vars[key] || defaultValue;
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  return result;
}

/**
 * Render a minimal story.
 * @param {string} subsystem - Subsystem name
 * @param {string} verb - Verb name
 * @returns {string} - Minimal story content
 */
export function renderMinimalStory(subsystem, verb) {
  return renderStoryTemplate({
    subsystem,
    verb,
    storyType: 'operation',
    purpose: 'Unknown. See Open Questions.',
    inputs: 'Unknown. See Open Questions.',
    outputs: 'Unknown. See Open Questions.',
    behavior: 'Unknown. See Open Questions.',
    existingImplementation: 'Unknown. See Open Questions.',
    asImplemented: 'Unknown. See Open Questions.',
    intendedBehavior: 'Unknown. See Open Questions.',
    constraints: 'Unknown. See Open Questions.',
    errors: 'Unknown. See Open Questions.',
    dependencies: 'Unknown. See Open Questions.',
    tests: 'Unknown. See Open Questions.',
    openQuestions: `- Q1: What is the purpose of this operation?
- Q2: What are the inputs?
- Q3: What are the outputs?
- Q4: What is the expected behavior?
- Q5: What errors can occur?`,
  });
}
