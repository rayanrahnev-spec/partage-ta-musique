const jwt=require('jsonwebtoken');
function requireAuth(req,res,next){const token=(req.headers.authorization||'').replace('Bearer ','');if(!token)return res.status(401).json({error:'Unauthorized'});try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}catch{return res.status(401).json({error:'Invalid token'});}}
function requireAdmin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({error:'Admin only'});next();}
module.exports={requireAuth,requireAdmin};
