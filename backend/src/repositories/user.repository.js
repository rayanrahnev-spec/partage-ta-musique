const db=require('../config/db');
async function createUser({email,passwordHash,publicName}){const r=await db.query(`INSERT INTO users (email,password_hash,public_name) VALUES ($1,$2,$3) RETURNING id,email,public_name,role,plan,created_at`,[email,passwordHash,publicName]);return r.rows[0];}
async function findUserByEmail(email){const r=await db.query(`SELECT id,email,password_hash,public_name,role,plan FROM users WHERE email=$1`,[email]);return r.rows[0];}
async function findUserById(id){const r=await db.query(`SELECT id,email,public_name,role,plan FROM users WHERE id=$1`,[id]);return r.rows[0];}
module.exports={createUser,findUserByEmail,findUserById};