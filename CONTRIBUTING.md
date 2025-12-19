### CONTRIBUTIONS

Contributions are welcome but must adhere to the existing dataset structure and annotation standards.

**Acceptable contributions**

- New hallucination annotations derived from existing model outputs

- Corrections or clarifications to existing annotations with supporting sources

- Additional prompts that align with the dataset’s focus on Black history, culture, and knowledge production

**Annotation requirements**

- All new records must conform to schema.json

- error_type must use the existing controlled vocabulary. If introducing a new error_type, justification will be needed.

- Each hallucination annotation must include a clear error_description and at least one reliable verification_source

**Process**

- Contributors should submit changes via pull request with a brief description of methodology and sources used

- Submissions may be reviewed for consistency, clarity, and methodological alignment

- Annotations that introduce new error categories or alter definitions will not be accepted without prior discussion


**Quick Start**

```bash
git clone https://github.com/srichardson0/Black_Knowledge_Erasure_Dataset_-BKED-.git
pip install -r requirements.txt
```
