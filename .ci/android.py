with open("../src-tauri/src/lib.rs", "r", encoding="utf-8")as f:
    content = f.read()
with open("../src-tauri/src/lib.rs", "w", encoding="utf-8")as f:
    f.write(content.replace('/*ifdef android', '').replace('endif android*/', ''))

import base64

with open("../src-tauri/src/assets.rs", "a", encoding="ascii") as rs:
	for i in [
		"pics.zip",
		"cards.cdb",
		"lflist.conf",
		"strings.conf",
		"cardinfo.conf",
		"textures\\cardI.jpg",
		"textures\\cardII.jpg",
		"textures\\unknown.jpg",
		"sound\\City of Night.wav",
		"sound\\Night View.wav"
	]:
		with open(i, "rb") as f:
			binary_data = f.read()
			base64_str = base64.b64encode(binary_data).decode('ascii')
			rs.write(f'pub const {i.split('\\')[-1].replace('.', '_').replace(' ', '_').upper()}: &str = "{base64_str}";\n')