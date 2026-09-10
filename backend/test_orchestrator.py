import os
import uuid
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("ORCHESTRATE_IAM_APIKEY")
WXO_URL = os.getenv("ORCHESTRATE_URL")

# Live Interview Mate Orchestrator A2A endpoint
ORCHESTRATOR_URL = (
    WXO_URL
    + "/v1/orchestrate/A2A/agents/"
    + "c2b2e180-01f1-4d8b-88b9-d4a9e88259d8"
    + "/environment/"
    + "a92cd1b3-4fe2-4196-9d5f-fc5fcf4d165f"
)

# Get IBM IAM access token
token_response = httpx.post(
    "https://iam.cloud.ibm.com/identity/token",
    data={
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": API_KEY,
    },
    headers={
        "Content-Type": "application/x-www-form-urlencoded"
    },
)

token_response.raise_for_status()
access_token = token_response.json()["access_token"]

# A2A message
payload = {
    "jsonrpc": "2.0",
    "id": str(uuid.uuid4()),
    "method": "message/send",
    "params": {
        "message": {
            "messageId": str(uuid.uuid4()),
            "role": "user",
            "parts": [
                {
                    "kind": "text",
                    "text": (
                        "Hello. I am testing InterviewMate AI. "
                        "Please introduce yourself and explain what "
                        "you can do for an interview candidate."
                    ),
                }
            ],
        }
    },
}

response = httpx.post(
    ORCHESTRATOR_URL,
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    json=payload,
    timeout=120,
)

print("A2A Status:", response.status_code)
print("\nResponse:")
print(response.text)