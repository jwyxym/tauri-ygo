import initSqlJs, { Database, QueryExecResult } from 'sql.js';
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

type SQL = Awaited<ReturnType<typeof initSqlJs>>;

class SQLiteReader {
	private SQL ?: SQL;

	async initSQLJS(): Promise<SQL> {
		if (!this.SQL) {
		this.SQL = await initSqlJs({ locateFile: () => wasmUrl });
		}
		return this.SQL;
	}

	private async execute<T>(database : Uint8Array, operation: (db: Database) => T): Promise<T> {
		const SQL = await this.initSQLJS();
		const db = new SQL.Database(database);

		try {
			const result = operation(db);
			return result;
		} finally {
			db.close();
		}
	}

	//查找数据库
	async find(database : Uint8Array, obj : {
		ot ?: number;
		id ?: number;
		alias ?: number;
		level ?: number;
		scale ?: number;
		atk ?: number;
		def ?: number;
		type ?: number;
		race ?: number;
		attribute ?: number;
		category ?: number;
		setcode ?: Array<string>;
		name ?: string;
		desc ?: string;
		hint ?: Array<string>;
	} = {}) : Promise<QueryExecResult> {
		let key = `
			SELECT * 
			FROM datas, texts 
			WHERE datas.id = texts.id
		`;
		
		if (obj.name) {
			if (obj.name.includes('%%')) {
			obj.name = obj.name.replace(/%%/g, '%');
			} else {
			obj.name = '%' + obj.name.replace(/%/g, '/%').replace(/_/g, '/_') + '%';
			}
			const temp = obj.name.replace(/'/g, "''");
			key += ` and texts.name like '${temp}' `;
		}
		
		if (obj.desc) {
			key += ` and texts.desc like '%${obj.desc.replace(/'/g, "''")}%' `;
		}
		
		if (obj.ot && obj.ot > 0) {
			key += ` and datas.ot = ${obj.ot} `;
		}
		
		if (obj.attribute && obj.attribute > 0) {
			key += ` and datas.attribute = ${obj.attribute} `;
		}
		
		if (obj.level && (obj.level & 0xff) > 0) {
			key += ` and (datas.level & 255) = ${obj.level & 0xff} `;
		}

		if (obj.scale && obj.scale> 0) {
			key += ` and ((datas.level & 4278190080) = ${obj.scale}`;
		}
		
		if (obj.race && obj.race > 0) {
			key += ` and datas.race = ${obj.race} `;
		}
		
		if (obj.type && obj.type > 0) {
			key += ` and (datas.type & ${obj.type}) = ${obj.type} `;
		}
		
		if (obj.category && obj.category > 0) {
			key += ` and (datas.category & ${obj.category}) = ${obj.category} `;
		}
		
		if (obj.atk == 0) {
			key += ' and (datas.type & 1) = 1 and datas.atk = 0';
		} else if (obj.atk && obj.atk != 0) {
			key += ` and datas.atk = ${obj.atk} `;
		}
		
		if (obj.type && (obj.type & 0x4000000) > 0) {
			if (obj.def) {
				key += ` and (datas.def & ${obj.def}) = ${obj.def} `;
			}
		} else {
			if (obj.def == 0) {
				key += ' and (datas.type & 1) = 1 and datas.def = 0';
			} else if (obj.def && obj.def != 0) {
				key += ` and datas.def = ${obj.def} `;
			}
		}
		
		if (obj.id && obj.id > 0 && obj.alias && obj.alias > 0) {
			key += ` and datas.id BETWEEN ${obj.alias} and ${obj.id} `;
		} else if (obj.id && obj.id > 0) {
			key += ` and (datas.id = ${obj.id} or datas.alias = ${obj.id}) `;
		} else if (obj.alias && obj.alias > 0) {
			key += ` and datas.alias = ${obj.alias} `;
		}
		
		if (obj.setcode) {
			for (const i of obj.setcode) {
				if (i == '0' || i == '') continue;
					const paddedCode = i.length < 3 ? '0'.repeat(3 - i.length) + i : i;
					const mask = 'f'.repeat(paddedCode.length);
					key += ` and (datas.setcode & 0x${mask} = 0x${paddedCode} or datas.setcode >> 16 & 0x${mask} = 0x${paddedCode} or datas.setcode >> 32 & 0x${mask} = 0x${paddedCode} or datas.setcode >> 48 & 0x${mask} = 0x${paddedCode}) `;
			}
		}

		return this.execute(database, (db) => {
			return db.exec(key)[0];
		});
	}

	//插入数据库
	async add(database : Uint8Array, obj : {
		ot ?: number;
		id ?: number;
		alias ?: number;
		level ?: number;
		scale ?: number;
		atk ?: number;
		def ?: number;
		type ?: number;
		race ?: number;
		attribute ?: number;
		category ?: number;
		setcode ?: Array<string>;
		name ?: string;
		desc ?: string;
		hint ?: Array<string>;
	} = {}) : Promise<QueryExecResult> {
		return this.execute(database, (db) => {
			return db.exec(`BEGIN;
				INSERT OR REPLACE INTO datas VALUES(${obj.id}, ${obj.ot}, ${obj.alias}, 0x${(obj.setcode as Array<string>).map(i => i.padStart(4, '0')).join('')}, ${obj.type}, ${obj.atk}, ${obj.def}, ${obj.level}, ${obj.race}, ${obj.attribute}, ${obj.category});"
				INSERT OR REPLACE INTO texts VALUES(${obj.id}, '${obj.name}', '${obj.desc}', ${(obj.hint as Array<string>).join(', ')};
				COMMIT;
			`)[0]
		});
	}
}

const SQL = new SQLiteReader()

export default SQL;