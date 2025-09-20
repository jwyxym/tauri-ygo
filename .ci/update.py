import json
import requests
from cookies_and_headers import cookies, headers

response = requests.request("GET", "https://web-api.gitcode.com/api/v2/projects/jwyxym%2Ftauri-ygo/releases/release-latest?tag_name=release-latest&repoId=jwyxym%252Ftauri-ygo", headers=headers, cookies=cookies)
data = json.loads(response.text)
print(data)
links = []

for link in data.get("assets").get("links"):
    links.append({
        "action" : "delete",
        "attachment_id" : link.get("attachment_id"),
        "id" : link.get("id"),
        "name" : link.get("name"),
        "size" : link.get("size"),
        "url" : link.get("url")
	})

if len(links) > 0:
	body = {
		"links" : links,
		"assets" : [],
		"description" : "tauri-ygo",
		"name" : "tauri-ygo",
		"tag_name" : "release-latest"
	}
	response = requests.request("PUT", "https://web-api.gitcode.com/api/v2/projects/jwyxym%2Ftauri-ygo/releases/release-latest", headers=headers, cookies=cookies, json=body)