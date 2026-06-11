const {z}=require('zod');
const createTrackSchema=z.object({artistId:z.string().uuid(),title:z.string().min(1).max(180),genre:z.string().max(80).optional(),description:z.string().max(2000).optional(),rightsConfirmed:z.literal('true'),noUnauthorizedSamples:z.literal('true')});
module.exports={createTrackSchema};
