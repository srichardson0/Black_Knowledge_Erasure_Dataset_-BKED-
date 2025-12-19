**Data Dictionary**

This data dictionary is generated from `schema.json` and documents the fields used in BKED CSV exports (e.g., `data/model_hallucinations.csv`, `data/model_responses_raw.csv`).

- **id**: integer — Unique identifier for each record.
- **prompt_id**: string — Identifier for the prompt (example: `P001`).
- **prompt**: string — Full text of the prompt that produced the model output.
- **model**: string — Model that produced the output. Allowed values: `gpt-5`, `gemini-2.5-flash`, `claude-haiku-4-5`.
- **date**: string — Timestamp when the response was generated or saved. Format: `YYYY-MM-DD_HH-MM-SS` (example: `2025-12-15_14-45-31`).
- **model_response**: string — Full model output text.
- **output_excerpt**: string (optional) — Short excerpt from `model_response` used in some processed exports (max 300 chars).
- **error_type**: string — Controlled vocabulary describing the type of error or hallucination. Allowed values:
  - `misattribution` — AI assigns a work/statement/action to the wrong person or organization.
  - `erasure_by_omission` — AI omits real, relevant scholars/artists/sources that should be mentioned.
  - `adjacent_error` — AI gives information close to correct but not what was asked (nearby location, related institution, associated work).
  - `invented_figure` — AI creates a person who never existed.
  - `temporal_error` — AI gives wrong dates or places events in the wrong period.
  - `geographical_error` — AI gives the wrong location (city/state/country/institution).
  - `factual_error` — AI provides incorrect factual details about real people, works, or events.
- **error_description**: string — Free-text description elaborating on the error identified during annotation.
- **verification_source**: string — URL or citation used to verify/refute the model output.
- **category**: string — Topical category for the prompt/record (free-text). Examples in this dataset: `black_art_artists`, `african_diaspora`, `black_texts_authors`, etc.
- **cultural_context_impacted**: string (optional) — Cultural or historical community affected by the hallucination.

Notes:
- The canonical schema is `schema.json` at repository root. Use that file for machine validation.
- `model_response` can contain long free text; processing scripts may create `output_excerpt` fields truncated to 300 characters.

