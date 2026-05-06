import { idpInstance } from "@src/services";

export const idpExtract = (docs: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      var formdata = new FormData();

      for (let doc of docs) {
        formdata.append("documents", {
          uri: doc.uri,
          type: doc.type,
          name: doc.name.replace(/[^a-zA-Z0-9. ]/g, ""),
        });
      }

      const response = await idpInstance.post(
        "/api/v2/extraction/document",
        formdata,
      );

      const responseData = response.data?.data["i-body"]?.TextResult;
      resolve(responseData);
    } catch (error) {
      resolve({});
    }
  });
};
