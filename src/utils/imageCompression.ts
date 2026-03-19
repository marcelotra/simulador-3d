/**
 * Redimensiona e comprime uma imagem Base64 para reduzir o tamanho ocupado no localStorage.
 * @param base64Str String da imagem original
 * @param maxWidth Largura máxima desejada
 * @param quality Qualidade do JPEG (0 a 1)
 */
export async function compressImage(base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
    });
}
