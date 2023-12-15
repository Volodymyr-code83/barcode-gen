import multer from 'multer';

const upload = multer({ dest: 'public/uploads/' });

export default upload.array('files', 10); // Allow uploading up to 10 files