import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        const res = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto"
            }
        )
        fs.unlinkSync(localFilePath);
        console.log(res)
        return res;
    }
    catch(error){
        fs.unlinkSync(localFilePath);  //removes locally saved temp file as upload failed
        return null;
    }
}

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export {uploadOnCloudinary};