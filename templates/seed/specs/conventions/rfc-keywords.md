# RFC Keywords

This project uses normative keywords inspired by RFC 2119 and RFC 8174.

## Keywords

| Keyword | Meaning |
|---------|---------|
| **MUST** | Absolute requirement. No exceptions. |
| **MUST NOT** | Absolute prohibition. No exceptions. |
| **SHOULD** | Recommended. Exceptions need justification. |
| **SHOULD NOT** | Discouraged. Exceptions need justification. |
| **MAY** | Optional. Implementer's choice. |

## Aliases

| Alias | Equivalent |
|-------|------------|
| REQUIRED | MUST |
| SHALL | MUST |
| SHALL NOT | MUST NOT |
| RECOMMENDED | SHOULD |
| NOT RECOMMENDED | SHOULD NOT |
| OPTIONAL | MAY |

## Usage Rules

1. Keywords MUST be uppercase for clarity
2. Keywords express intent, not enforcement
3. Use sparingly — not every sentence needs a keyword
4. Prefer SHOULD over MUST when flexibility is acceptable

## Examples

**Good:**
- "The API MUST return JSON."
- "Responses SHOULD include a timestamp."
- "Clients MAY cache results for up to 5 minutes."

**Avoid:**
- "The API must return JSON." (lowercase — ambiguous)
- "The API MUST ALWAYS return JSON." (redundant — MUST already means always)
