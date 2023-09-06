
export const fileFilter = (req: Express.Request,file: Express.Multer.File,callback:Function) =>{

    // console.log({file})

    if(!file) return callback(new Error('File is empty'), false);

    const fileExtension =file.mimetype.split("/")[1]; //el mimetyoe nos indica el tipo de archivo que es

    const validExtension = ['jgp','jpeg','png','git'];

    if(validExtension.includes(fileExtension)){
        return callback(null,true)
    }



    callback(null,false)
}