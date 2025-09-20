import sys
import json
import requests

token = sys.argv[1]
file_name = sys.argv[2]
url = f"https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/releases/release-latest/upload_url?access_token={token}&file_name={file_name}"

payload = {}
headers = {
  'Accept': 'application/json'
}

response = requests.request("GET", url, headers=headers, data=payload)
data = json.loads(response.text)
files = {"file": (file_name, open(file_name, "rb"), "application/octet-stream")}
response = requests.request("PUT", data.get('url'), headers=data.get('headers'), files=files)