import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export function database(file=':memory:'){
 const db=new DatabaseSync(file);
 db.exec(fs.readFileSync('drizzle/0000_tables.sql','utf8').replaceAll('--> statement-breakpoint','').replaceAll('CREATE TABLE ','CREATE TABLE IF NOT EXISTS '));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values)},async all(){return {results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)||null},async run(){return db.prepare(sql).run(...args)}});
 return {prepare:wrap,batch:async stmts=>{db.exec('BEGIN');try{const results=[];for(const s of stmts)results.push(await s.run());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}}};
}
