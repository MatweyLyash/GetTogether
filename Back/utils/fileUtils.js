async function getMimeType(buffer) {
    try {
        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(buffer);
        return type?.mime || 'image/jpeg';
    } catch (error) {
        console.error('Error detecting file type:', error);
        return 'image/jpeg';
    }
}

module.exports = { getMimeType };
