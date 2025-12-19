# Black Knowledge Erasure Dataset (BKED)

Creator: Sasha Richardson (srichardson1@gradcenter.cuny.edu)

Institution: The Graduate Center, CUNY

Course: Introduction to Digital Humanities, Fall 2025

License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (MIT License)

  
---

### Purpose
Large language model hallucinations are typically evaluated using generic factual benchmarks that overlook culturally specific forms of error. In domains related to Black history, culture, and intellectual production, model failures often appear not only as incorrect facts, but as omissions, misattributions, and invented authorities that mirror longstanding patterns of epistemic erasure.

The Black Knowledge Erasure Dataset (BKED) was created to document, classify, and analyze these failures. Rather than treating hallucinations as isolated technical defects, BKED frames them as patterned behaviors with cultural and historical consequences, particularly in downstream contexts such as education, archives, and public scholarship.

To address this gap, BKED:

- Focuses explicitly on prompts grounded in Black studies–relevant domains

- Preserves full model outputs alongside human-verified annotations

- Employs curator-led verification using external scholarly and archival sources

- Enables comparison across multiple major large language model families

The dataset supports both qualitative and quantitative analysis of hallucination patterns across models, prompt framings, and topical categories. It is designed for model auditing, critical AI research, and methodological experimentation, rather than leaderboard-style performance evaluation.

**Intended users** include computational social scientists, digital humanists, AI auditors, ethicists, and library or archival researchers. But of course, everyone is welcome to explore!

**Potential research questions supported by BKED include:**

- What types of distortions most frequently occur when models respond to questions about Black cultural and historical topics?

- How do hallucination patterns vary across models and prompt formulations?

- Which verification sources and annotation strategies are most effective for human-in-the-loop validation?

**Limitations and appropriate use:**
BKED catalogs model errors and should not be treated as a verified historical corpus; users should consult primary sources for factual claims. Annotations are human-coded and involve interpretive judgment. Model outputs reflect behavior during the collection window (2025-12-15 to 2025-12-18) and may not generalize to later model versions.

---

### Instructions for Users

**Recommended starting points**

- Use data/model_hallucinations.csv for analyses of error types, frequency, and qualitative patterns.

- Use data/model_responses_raw.csv if you wish to re-run or extend the annotation process.

- Refer to docs/data_dictionary.md and schema.json for field definitions and validation rules.

**Usage notes**

- Records in model_hallucinations.csv represent verified model errors and should not be treated as factual sources.

- Absence of an error in model_responses_raw.csv does not imply correctness; hallucinations are curated and identified in model_hallucinations.csv.

- Model outputs reflect behavior at the time of collection and may not generalize to future model versions.

**Reproducibility**

- Users wishing to reproduce model calls should consult prompt_master.csv and archived JSON files in model_outputs/.

- API credentials are not included; users must supply their own and comply with provider terms of service.

**Citation**

- If using this dataset in published work, cite the dataset and describe any additional annotation or filtering steps applied.


---


### General Information

Data was generated from AI model APIs (GPT-5, Google Gemini, Claude). Prompts and human verification sources used to derive labelled hallucinations.

Date of data collection: 2025-12-15 to 2025-12-18 

### Data and File Overview


```
/
├─ data/                   # Processed CSVs (Hallucinations, Raw Responses, Prompts)
├─ model_outputs/          # Raw JSON responses organized by model family
├─ src/                    # Python scripts for collection and aggregation
├─ docs/                   # Detailed - methodology.md and data_dictionary.md
└─ schema.json             # Validation rules for dataset records
```

Relationship between files:
  - `src/collect_records.py` generates JSON response files saved under `model_outputs/<model>/`.
  - `src/append_records.py` and related scripts aggregate/transform JSON files into the `data/` CSV files.
  - `schema.json` defines validation rules used by processing scripts.


---

### Summary of Methodology

BKED utilizes a curated set of prompts across categories like black_art_artists and african_diaspora. Responses were captured from GPT-5, Gemini 2.5 Flash, and Claude Haiku 4.5.

**Annotation Process:**

1. Hallucination Extraction: Identifying potential errors in raw outputs.

2. Classification: Mapping errors to a controlled vocabulary (e.g., misattribution, invented_figure).

3. Verification: Grounding corrections in external scholarly/archival sources.

[!IMPORTANT]
BKED is a catalog of errors. Do not use this dataset as a factual historical source. Always refer to the verification_source column or primary archives.

**Full details on sampling, preprocessing, and QA are available in `docs/methodology.md.`**

---

### Ethical Considerations

**Cultural sensitivity:** The dataset contains content about marginalized communities and historical experiences; annotations explicitly flag cultural contexts affected.

**Privacy:** No personal, non-public, or identifiable private data was intentionally collected. All model outputs and prompts are archived for research transparency.

**Responsible use:** The dataset documents model errors and should not be used as a source of truth; users are encouraged to consult original primary sources for verification.

---

### Data Specific Information: `data/model_hallucinations.csv`

- Number of variables: 10
- Number of cases/rows: 101

**Variable List**


| Variable             | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| id                   | Unique integer identifier for the record.                                   |
| prompt_id            | Foreign key referencing `data/prompt_master.csv` (e.g., `P001`).            |
| model                | The model that generated the response (e.g., `gpt-5`, `gemini-2.5-flash`).   |
| model_response       | The full, unedited text output from the model.                              |
| error_type           | Controlled vocabulary label (e.g., `erasure_by_omission`, `factual_error`).  |
| error_description    | Detailed qualitative explanation of the identified error.                   |
| verification_source  | URL or citation used to verify or refute the model claim.                   |
| category             | Topical category (e.g., `black_texts_authors`).                              |

<br/>

>This README.md file was generated on 2025-12-19 by Sasha Richardson



