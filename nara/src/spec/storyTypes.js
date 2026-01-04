export const STORY_TYPES = {
  page: {
    required: ['ID', 'Type', 'Purpose', 'Behavior'],
  },
  component: {
    required: ['ID', 'Type', 'Purpose', 'Behavior'],
  },
  operation: {
    required: ['ID', 'Type', 'Purpose', 'Inputs', 'Outputs', 'Behavior', 'Errors'],
  },
  endpoint: {
    required: ['ID', 'Type', 'Purpose', 'Inputs', 'Outputs', 'Behavior', 'Errors'],
  },
};

export const STORY_TYPE_LIST = Object.keys(STORY_TYPES);

export function getRequiredSectionsForType(type) {
  const entry = STORY_TYPES[type];
  if (!entry) {
    return ['ID', 'Type', 'Purpose', 'Behavior'];
  }
  return entry.required;
}
