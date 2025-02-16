function blobToBase64(blob: Blob)
{
    return new Promise((resolve, reject) =>
    {
        const reader = new FileReader();

        reader.onloadend = () =>
        {
            if (typeof reader.result === 'string')
            {
                resolve(reader.result);
            }
            else
            {
                reject(new Error('Failed to convert blob to base64'));
            }
        };

        reader.onerror = () =>
        {
            reject(new Error('Failed to convert blob to base64'));
        };

        reader.readAsDataURL(blob);
    });
}

export { blobToBase64 };
