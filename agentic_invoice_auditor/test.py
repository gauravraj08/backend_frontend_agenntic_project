from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
# load_dotenv()
load_dotenv(override=True)

model=ChatGoogleGenerativeAI(model="gemini-2.0-flash")

import os
# Print only the last 5 chars to be safe
key = os.environ.get("GOOGLE_API_KEY", "Not Set")
print(f"Current loaded key ends with: ...{key}")

print(model.invoke("Hello, world!").content)