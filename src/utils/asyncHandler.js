// export const asynHandler = (fn) =>async (req,res,next) => {
//     try{
//         await fn(req,res,next)  //next if just a flag for middlewares to move to the next one
//     }
//     catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message,
//         })
//     }
// }


export const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(
            requestHandler(req,res,next)
        ).catch((err) => next(err) )
    }
};