
class Message<T> {
	len ?: number;
	content : T;
	constructor (content : T, len : number = 0) {
		this.content = content;
		if (len > 0)
			this.len = len;
	}

	length = () : number => {
		return typeof this.content === 'string' ? this.len ?? (this.content.length + 1) * 2 : this.len !== undefined ? this.len / 8 : 2;
	}

	write = (buffer : ArrayBuffer, data : DataView, pos : number) : number => {
		const write_str = () : number => {
			if (typeof this.content !== 'string') return 0;
			const len = this.length();
			for (let i = 0; i < this.content.length; i++) {
                const current_pos = pos + i * 2;
                if (current_pos >= buffer.byteLength) break;
                data.setUint16(current_pos, this.content.charCodeAt(i), true);
			}
			return len;
		}
		const write_int = () : number => {
			if (typeof this.content !== 'number') return 0;
			const len = this.length();
			switch (len) {
				case 1:
					data.setUint8(pos, this.content);
					break;
				case 2:
					data.setUint16(pos, this.content, true);
					break;
				case 4:
					data.setUint32(pos, this.content, true);
					break;
				case 8:
					data.setBigUint64(pos, BigInt(this.content), true);
					break;
				default:
					for (let i = 0; i < len; i++)
						data.setUint8(pos + i, 0);
					break;
			}
			return len;
		};
		return typeof this.content === 'string' ? write_str() : write_int();
	}
};

export default Message;