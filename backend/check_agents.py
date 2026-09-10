import os
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("ORCHESTRATE_IAM_APIKEY")
wxo_url = os.getenv("ORCHESTRATE_URL")

# Get IAM token
token_response = httpx.post(
    "https://iam.cloud.ibm.com/identity/token",
    data={
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key,
    },
    headers={
        "Content-Type": "application/x-www-form-urlencoded"
    },
)

token_response.raise_for_status()
access_token = token_response.json()["access_token"]

# Discover WXO agents
response = httpx.post(
    wxo_url + "/v1/orchestrate/A2A",
    headers={
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/json",
    },
    json={
        "jsonrpc": "2.0",
        "id": "1",
        "method": "agents/get",
        "params": {},
    },
)

print("A2A Status:", response.status_code)

data = response.json()

if response.status_code == 200:
    print("\nAvailable Agents:\n")

    for agent in data["result"]["agentCards"]:
        print("Name:", agent["name"])
        print("URL:", agent["url"])
        print("-" * 60)
else:
    print(response.text)