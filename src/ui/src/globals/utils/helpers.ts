export const toBase64 = (file: File): Promise<any> => new Promise(
  async (resolve, reject) => {
    const reader = new FileReader();
    await reader.readAsDataURL(file);
    reader.onload = () => {
        resolve((reader.result as string).split(',')[1])
    };
    reader.onerror = error => reject(error);
  });
