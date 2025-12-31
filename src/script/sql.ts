import initSqlJs, { Database, QueryExecResult } from 'sql.js';
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

import fs from './fs';

type SQL = Awaited<ReturnType<typeof initSqlJs>>;

class SQLiteReader {
	private SQL ?: SQL;

	private initSQLJS = async () : Promise<SQL | undefined> => {
		try {
			if (!this.SQL)
				this.SQL = await initSqlJs({ locateFile: () => wasmUrl });
			return this.SQL;
		} catch (e) {
			fs.write.log(e);
		}
		return undefined;
	};

	private execute = async ( cdb : Uint8Array<ArrayBuffer>, operation : (db : Database) => QueryExecResult) : Promise<QueryExecResult | undefined> => {
		const SQL = await this.initSQLJS();
		if (!SQL)
			return undefined;
		const db = new SQL.Database(new Uint8Array(cdb));
		let result : QueryExecResult | undefined = undefined;
		try {
			result = operation(db);
		} catch (e) {
			fs.write.log(e);
		} finally {
			db.close();
		}
		return result;
	}

	async find(cdb : Uint8Array<ArrayBuffer>) : Promise<QueryExecResult | undefined> {
		let key = `
			SELECT * 
			FROM datas, texts 
			WHERE datas.id = texts.id
		`;

		return this.execute(cdb, (db) => {
			return db.exec(key)[0];
		});
	}
}

const SQL = new SQLiteReader()

export default SQL;