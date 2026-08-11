function ApiResponse(res,status,message,data=null){
    const responseBody = {
        success: true,
        message: message
    }
    if(data!==null && data!==undefined){
        responseBody.data = data;
    }
    return res.status(status).json(responseBody)
}

export default ApiResponse;
