const PLAN_LIMITS={free:1,starter:10,pro:50,label:999999};
function getUploadLimit(plan){return PLAN_LIMITS[String(plan||'free').toLowerCase()]??1;}
function canUpload(plan,count){return count<getUploadLimit(plan);}
module.exports={getUploadLimit,canUpload};
