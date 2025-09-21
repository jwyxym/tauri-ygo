import sys
import json
import requests

token = sys.argv[1]

#删除Tag
url = f"https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/tags/release-latest?access_token={token}"

payload = {}
headers = {
  'Accept': '*/*'
}
response = requests.request("DELETE", url, headers=headers, data=payload)

#创建Tag
url = f"https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/tags?access_token={token}"
payload = json.dumps({
  "refs": "main",
  "tag_name": "release-latest",
  "tag_message": "tauri-ygo"
})
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)

#创建Release
url = f"https://api.gitcode.com/api/v5/repos/jwyxym/tauri-ygo/releases?access_token={token}"
payload = json.dumps({
  "tag_name": "release-latest",
  "name": "tauri-ygo",
  "body": "tauri-ygo",
})
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
response = requests.request("POST", url, headers=headers, data=payload)