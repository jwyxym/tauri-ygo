import json
import sys

os = sys.argv[1] if len(sys.argv) >= 2 else ''
version = sys.argv[2] if len(sys.argv) >= 3 else '0.1.0'
tauri_config = {
	"$schema" : "https://schema.tauri.app/config/2",
	"productName" : "tauri-ygo",
	"version" : version,
	"identifier" : "com.tauri.ygopro",
	"build" : {
		"beforeDevCommand" : "npm run dev",
		"devUrl" : "http://localhost:1420",
		"beforeBuildCommand" : "npm run build",
		"frontendDist" : "../dist"
	},
	"app" : {
		"windows" : [
			{
				"title" : "tauri-ygo",
				"width" : 1600,
				"height" : 800
			}
		],
		"security" : {
			"csp" : {
				"img-src" : "'self' asset: http: https: blob: data:"
			},
			"assetProtocol" : {
				"enable" : True,
				"scope" : {
					"allow" : ["$PUBLIC/**", "$RESOURCE/**"]
				}
			}
		}
	},
	"bundle" : {
		"active" : True,
		"targets" : "all",
		"icon" : [
			"icons/32x32.png",
			"icons/128x128.png",
			"icons/128x128@2x.png",
			"icons/icon.icns",
			"icons/icon.ico"
		]
	}
}
if os == 'windows':
    tauri_config["bundle"]["resources"] = [
		"assets.zip"
	]

path = '../src-tauri/tauri.conf.json'
with open(path, 'w', encoding = 'utf-8') as f :
    json.dump(tauri_config, f, indent = 4)