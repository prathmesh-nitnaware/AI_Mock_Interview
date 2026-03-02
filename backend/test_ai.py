import ollama
try:
    response = ollama.chat(model='llama3:8b', messages=[{'role': 'user', 'content': 'hi'}])
    print("CONNECTION SUCCESSFUL:", response['message']['content'])
except Exception as e:
    print("CONNECTION FAILED:", e)