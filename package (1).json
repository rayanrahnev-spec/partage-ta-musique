const db=require('../config/db');
async function createReport({trackId,reporterEmail,reason}){const r=await db.query(`INSERT INTO reports (track_id,reporter_email,reason) VALUES ($1,$2,$3) RETURNING *`,[trackId,reporterEmail||null,reason]);return r.rows[0];}
async function listReports(){const r=await db.query(`SELECT r.*,t.title AS track_title FROM reports r LEFT JOIN tracks t ON t.id=r.track_id ORDER BY r.created_at DESC`,[]);return r.rows;}
module.exports={createReport,listReports};