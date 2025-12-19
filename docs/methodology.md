### Methodology

**Data sources and sampling**
- Prompts: The study uses a curated set of 94 prompts listed in `data/prompt_master.csv`. Prompts were designed to elicit factual, historical, and cultural responses relevant to Black studies (categories include `black_art_artists`, `african_diaspora`, `black_texts_authors`, etc.).
- Models: Each prompt was submitted to multiple large language models (LLMs) — `gpt-5`, `gemini-2.5-flash`, and `claude-haiku-4-5` — to sample cross-model behavior.
- Sampling window: Collection occurred between 2025-12-15 and 2025-12-18; responses are timestamped and saved in `model_outputs/<model>/`.


**Data collection procedure**
1. Prompt preparation: Prompts were drafted and reviewed for clarity and topical coverage; each prompt includes a unique `prompt_id` and a topical `category` recorded in `data/prompt_master.csv`.
2. Programmatic querying: The `src/collect_records.py` script drove model queries. For each model and prompt, the script sends the prompt (optionally with a short instruction) and receives a textual response. Each response is saved as a JSON record in `model_outputs/<model>/` containing at minimum: `timestamp`, `model`, `prompt_id`, `prompt`, `category`, `verification_source`, and `response`.
3. Archival: JSON files are named with `prompt_id` and timestamp (`YYYY-MM-DD_HH-MM-SS`) to allow traceability and reproducibility of model output at the time of collection.

**Preprocessing and aggregation**
- Aggregation: The `src/append_records.py` script ingests all JSON files under `model_outputs/` and appends new entries to `data/model_responses_raw.csv`. This CSV contains one row per model+prompt pair and stores the full `model_response` text along with metadata.
- Normalization: The script normalizes whitespace in model responses, ensures consistent timestamp formatting, and avoids duplicate model+prompt entries by tracking existing `(model, prompt_id)` keys.
- Note: `append_records.py` intentionally updates only `data/model_responses_raw.csv`. Extraction of hallucinations and creation/updating of `data/model_hallucinations.csv` is performed as a separate, curator-driven step described below.

**Annotation protocol (identifying hallucinations)**

Annotation is a human-led, structured process used to identify, classify, and document hallucinations in model outputs. Key steps:
1. Candidate extraction: Curators review `data/model_responses_raw.csv` and identify candidate outputs that appear to contain fabricated, misattributed, or otherwise incorrect claims. Candidate rows are copied or referenced into a working annotation table.
2. Classification: Annotators assign an `error_type` from the controlled vocabulary:
   - `misattribution`, `erasure_by_omission`, `adjacent_error`, `invented_figure`, `temporal_error`, `geographical_error`, `factual_error`.
3. Description: For each annotated record, annotators write an `error_description` that explains why the output is erroneous, with supporting citations where available.
4. Verification: Annotators supply a `verification_source` (URL or citation) that was used to confirm or refute the claim. If no reliable verification source exists, annotators flag the record for further review.
5. Export: Curated and annotated hallucination records are stored in `data/model_hallucinations.csv` with the schema defined in `schema.json`.

**Quality assurance and validation**
- Schema validation: I validate exported CSVs against `schema.json` to ensure required fields and data types are present. A lightweight validation script was used to check `data/model_hallucinations.csv` (result: 1 record had an empty `error_type` and was flagged for review).
- Inter-annotator checks: When possible, multiple annotators review the same candidate records; disagreements are resolved via discussion and a consensus annotation is recorded.
- Controlled vocabularies: Use of the controlled `error_type` vocabulary and `category` normalization reduces categorical drift and aids downstream analysis.

**Software, reproducibility, and environment**
- Code: Collection and aggregation scripts are in the `src/` folder. `collect_records.py` handles API queries and saving JSON outputs; `append_records.py` aggregates into `data/model_responses_raw.csv`.
- Environment: Recommended Python version is 3.10+; dependencies are listed in `requirements.txt` (notably `pandas`, `openai`, `google-genai`, `anthropic`).
- Reproducibility: JSON archives in `model_outputs/` plus `prompt_master.csv` provide the provenance necessary to reproduce model calls. Where possible, include API parameters and model versions in the JSON records.

**Limitations**
- API variation: Model behavior may change over time; archived JSONs capture responses at collection time but cannot account for downstream model updates.
- Annotation subjectivity: Some classification decisions (e.g., `adjacent_error` vs. `misattribution`) can be subjective.