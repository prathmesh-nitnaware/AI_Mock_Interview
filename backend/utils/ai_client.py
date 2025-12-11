import os
from mistralai import Mistral

# --- CONFIGURATION ---
# Your API Key is set correctly here
API_KEY = "TGi0p7qgMVRW9sqqHZzhhZWexfcyXQLA"

# The Fix: Only warn if the key is empty or still the default placeholder
if not API_KEY or API_KEY == "YOUR_MISTRAL_API_KEY_HERE":
    print("⚠️ WARNING: Mistral API Key is missing in utils/ai_client.py")

# Initialize the client
client = Mistral(api_key=API_KEY)

# Centralize model name
MODEL_NAME = "mistral-large-latest"