import axios from "axios";
import { getError } from "./getError";



export const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23

export const uploadFileHandler = async(file, userData)=>{
    try{
     const bodyFormData = new FormData()
     bodyFormData.append('file', file)
     const {data} = await axios.post('/api/upload/', bodyFormData, {
       headers :{
         'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userData?.token}`,
       }
     })
     return data.secure_url
    }catch(error){
      //setLoading(false)
     getError(error)
     throw getError(error);
    }
   }