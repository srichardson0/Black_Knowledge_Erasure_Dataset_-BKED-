import json
import os
import datetime
import csv
from pathlib import Path
import openai
from google import genai
from anthropic import Anthropic

# API Keys
openai.api_key = ""
CLAUDE_API_KEY = ""
GEMINI_API_KEY = ""

# Initialize clients
claude_client = Anthropic(api_key=CLAUDE_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


def save_output(model, prompt_id, prompt, category, source_link, response):
    """Save model output to JSON file"""
    ts = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    folder = Path(f"model_outputs/{model}")
    folder.mkdir(parents=True, exist_ok=True)
    
    filename = folder / f"{prompt_id}_{ts}.json"
    record = {
        "timestamp": ts,
        "model": model,
        "prompt_id": prompt_id,
        "prompt": prompt,
        "category": category,
        "verification_source": source_link,
        "response": response
    }
    with open(filename, "w") as f:
        json.dump(record, f, indent=2)


def ask_openai(model, prompt):
    """Query OpenAI API"""
    response = openai.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


def ask_claude(model, prompt):
    """Query Claude API"""
    response = claude_client.messages.create(
        model=model,
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text


def ask_gemini(model, prompt):
    """Query Google Gemini API"""
    response = gemini_client.models.generate_content(
        model=model,
        contents=prompt
    )
    return response.text


def ask_model(model, prompt, prompt_id, category, verification_source=None):
    """Route to appropriate API based on model name"""
    try:
        # Prepend instruction only when sending to models; do not alter saved prompt
        instruction = "Answer in 1 to 2 sentences."
        modified_prompt = f"{instruction} {prompt}"
        if model.startswith("gpt"):
            text = ask_openai(model, modified_prompt)
        elif model.startswith("claude"):
            text = ask_claude(model, modified_prompt)
        elif model.startswith("gemini"):
            text = ask_gemini(model, modified_prompt)
        else:
            raise ValueError(f"Unknown model type: {model}")
        
        # Save the original prompt in the JSON (not the modified one)
        save_output(model, prompt_id, prompt, category, verification_source, text)
        return text
    except Exception as e:
        error_msg = f"Error with {model}: {str(e)}"
        print(error_msg)
        return error_msg


def read_prompts_from_csv(csv_path, prompt_ids=None):
    """
    Read prompts from CSV file
    
    Args:
        csv_path: Path to CSV file
        prompt_ids: List of specific prompt IDs to load (e.g., ['P001', 'P002'])
                   If None, loads all prompts
    """
    prompts = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # Strip whitespace from keys
            row = {k.strip(): v for k, v in row.items()}
            
            # If specific prompt_ids requested, filter by them
            if prompt_ids is None or row['prompt_id'] in prompt_ids:
                prompts.append({
                    'prompt_id': row['prompt_id'],
                    'prompt_text': row['prompt'],
                    'category': row['category'],
                    'source_link': row['source_link']
                })
    
    return prompts


def run_tests(csv_path, models, prompt_ids=None):
    """
    Run prompts through all models
    
    Args:
        csv_path: Path to CSV file
        models: List of model names to test
        prompt_ids: List of specific prompt IDs to run (e.g., ['P001', 'P002'])
                   If None, runs all prompts
    """
    prompts = read_prompts_from_csv(csv_path, prompt_ids)
    
    if not prompts:
        print(f"No prompts found with IDs: {prompt_ids}")
        return
    
    print(f"Testing {len(prompts)} prompts across {len(models)} models...\n")
    
    for prompt_data in prompts:
        prompt_id = prompt_data['prompt_id']
        prompt_text = prompt_data['prompt_text']
        category = prompt_data['category']
        verification_source = prompt_data['source_link']
        
        print(f"Processing {prompt_id} ({category})...")
        
        for model in models:
            print(f"  - Querying {model}...")
            answer = ask_model(model, prompt_text, prompt_id, category, verification_source)
            print(f"    Response: {answer[:50]}...\n")


if __name__ == "__main__":
    # Define models to test
    models_to_test = [
        "gpt-5",
        "claude-haiku-4-5",
        "gemini-2.5-flash"
    ]
    
    # Option 1: Run ALL prompts
    run_tests("data/prompt_master - Copy.csv", models_to_test)
    
    # Option 2: Run SPECIFIC prompts by ID
    # run_tests("data/prompt_master - Copy.csv", models_to_test, prompt_ids=['P080'])
    
