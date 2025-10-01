import { idpInstance } from '@src/services';
import axios from 'axios';

export const idpExtract = (docs: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      var formdata = new FormData();

      for (let doc of docs) {
        console.log(doc.type, doc.name);
        formdata.append('documents', {
          uri: doc.uri,
          type: doc.type,
          name: doc.name.replace(/[^a-zA-Z0-9. ]/g, ''),
        });
      }
      formdata.append('prompt', 'Extract all data into key-value pairs');

      // const response = await axios.post(
      //   'http://3.146.230.106:8000/api/v1/extraction/data',
      //   formdata,
      //   {
      //     headers: {
      //       Accept: 'application/json',
      //     },
      //   },
      // );

      const response = await fetch(
        'http://3.146.230.106:8000/api/v1/extraction/data',
        {
          method: 'POST',
          body: formdata,
          headers: {
            Accept: 'application/json',
          },
        },
      );
      const result = await response.json();

      console.log(result?.response);

      const responseData = result?.response;
      resolve(responseData);
    } catch (error) {
      console.log(error);
      resolve({});
    }
  });
};
