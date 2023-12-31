const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads');
  },
  filename: (req, file, cb)=> {
   /*  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension); */
    cb(null, Date.now() + "_" + file.originalname)
    
  }
});

const upload = multer({ storage });

module.exports = upload;