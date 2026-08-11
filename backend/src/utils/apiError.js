
function ApiError(res,status,message="Server Error",err=null){
    const errorData = {
        message: message,
        success: false
    }
    if(err!==null && err!==undefined){
        errorData.error = err;
    }
    return res.status(status).json(errorData);
}

export default ApiError;