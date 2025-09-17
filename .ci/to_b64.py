import base64

with open("assets.rs", "a", encoding="ascii") as rs:
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