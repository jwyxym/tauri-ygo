# with open ("assets.b64", "r", encoding="utf-8") as f:
#     with open ("assets.rs", "w", encoding="utf-8") as rs:
#         rs.write(f'pub const ZIP: &str = "{f.readline().strip()}";')

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

with open("assets.rs", "r", encoding="ascii") as rs:
    for line in rs:
        print(line[: 50])