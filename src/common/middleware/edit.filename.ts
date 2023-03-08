import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = uuid();
  callback(null, `${name}-${randomName}${fileExtName}`);
};
