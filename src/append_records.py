import os
import json
import pandas as pd
from pathlib import Path

RAW_DIR = Path("model_outputs")
OUTPUT_CSV = Path("data/model_responses_raw.csv")

# Columns in final CSV
COLUMNS = [
    "id",
    "prompt_id",
    "prompt",
    "model",
    "model_response",
    "date",
    "error_type",  
    "error_description",            
    "verification_source",
    "category",                
]

def load_json_files(raw_dir):
    """Yield all JSON files from subfolders of raw_dir."""
    for model_folder in raw_dir.iterdir():
        if model_folder.is_dir():
            for file in model_folder.glob("*.json"):
                yield file

def process_json(file_path):
    """Extract available fields from a JSON file."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
 
    # Normalize the model response: remove newline characters and collapse
    # repeated whitespace into single spaces so CSV fields are compact.
    raw_response = data.get("response")
    normalized_response = " ".join(str(raw_response).split())

    record = {
        "prompt_id": data.get("prompt_id"),
        "prompt": data.get("prompt"),
        "model": data.get("model"),
        "model_response": normalized_response,
        "date": data.get("timestamp"),
        "error_type": "",      
        "error_description": "",          
        "verification_source": data.get("verification_source"),
        "category": data.get("category"),
    }
    return record

def main():
    # Load existing CSV if it exists
    if OUTPUT_CSV.exists():
        df = pd.read_csv(OUTPUT_CSV)
        # Determine next id safely (handle empty or non-numeric)
        try:
            next_id = int(pd.to_numeric(df["id"], errors="coerce").max()) + 1
        except Exception:
            next_id = 1
    else:
        df = pd.DataFrame(columns=COLUMNS)
        next_id = 1

    # Build a set of existing (model, prompt_id) pairs so we only add new
    existing_keys = set()
    if not df.empty:
        # Use stringified values for robust matching
        for _, row in df.iterrows():
            m = row.get("model")
            pid = row.get("prompt_id")
            if pd.isna(m) or pd.isna(pid):
                continue
            existing_keys.add((str(m), str(pid)))

    # Collect new records, avoid repeated DataFrame concats for speed
    new_records = []
    for json_file in load_json_files(RAW_DIR):
        record = process_json(json_file)
        # Ensure model and prompt_id exist in the JSON
        model_val = record.get("model")
        prompt_id_val = record.get("prompt_id")
        if model_val is None or prompt_id_val is None:
            # skip malformed records
            continue

        key = (str(model_val), str(prompt_id_val))
        if key in existing_keys:
            # Already have this model+prompt_id, skip
            continue

        # Assign id and add
        record["id"] = next_id
        next_id += 1
        new_records.append(record)
        existing_keys.add(key)

    if new_records:
        df = pd.concat([df, pd.DataFrame(new_records)], ignore_index=True)

    # Save updated CSV
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")
    print(f"Updated CSV saved to {OUTPUT_CSV}. Total records: {len(df)}")

if __name__ == "__main__":
    main()
