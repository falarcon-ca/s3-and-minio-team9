const fileElement = document.getElementById('fileElem');
const cloudServiceElement = document.getElementById('cloudService');

// File Input Event
fileElement.addEventListener('change', async (e) => {
  const selectedFile = e.target.files[0];
  const cloudService = cloudServiceElement.value;

  const signedUrl = await GetSignedUrlForPutObjectAsync(selectedFile.name, cloudService);
  try {
    await UploadFileAsync(signedUrl, selectedFile);
    alert('The file was uploaded successfully!');
  } catch (error) {
    alert('Something went wrong, see the console for more details!');
    console.error(error);
  } finally {
    fileElement.value = '';
  }
}, false);

// S3/Minio client
function getS3Client(cloudService) {
  let config;
  if (cloudService === 'minio') {
    config = {
      endpoint: 'http://localhost:9000',
      accessKeyId: 'minio.user',
      secretAccessKey: 'minio.pass',
      params: { Bucket: 'team9' },
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    }
  } else if (cloudService === 's3') {
    config = {
      accessKeyId: 'AKIA2L2KP52JFP6OGBUC',
      secretAccessKey: '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',
      params: { Bucket: 'team9' },
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    }
  }

  return new AWS.S3(config);
}

// 1/2 Signed URL
async function GetSignedUrlForPutObjectAsync(keyName, cloudService) {
  const s3 = getS3Client(cloudService);
  const params = { Key: keyName };
  return await new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, url) => {
      err ? reject(err) : resolve(url);
    });
  });
}

// 2/2 Upload File action
async function UploadFileAsync(url, file) {
  const blob = new Blob([file], { type: file.type });
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: blob,
    });
    if (!response.ok) throw response;
  } catch (error) {
    throw error;
  }
}