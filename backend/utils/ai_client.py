import os
from mistralai import Mistral

# REPLACE WITH YOUR ACTUAL KEY
API_KEY = "TGi0p7qgMVRW9sqqHZzhhZWexfcyXQLA"

if not API_KEY:
    raise ValueError("Mistral API Key is missing!")

# Initialize the client
client = Mistral(api_key=API_KEY)

# Centralize the model name here so you can change it easily
# Options: "mistral-large-latest" (Best), "mistral-small-latest" (Fast/Cheap)
MODEL_NAME = "mistral-large-latest"