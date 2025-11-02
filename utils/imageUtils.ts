
/**
 * Converts a standard Google Drive file viewer URL into a direct, embeddable image URL.
 * @param url The original Google Drive URL (e.g., https://drive.google.com/file/d/FILE_ID/view)
 * @returns A direct image URL (e.g., https://drive.google.com/uc?export=view&id=FILE_ID)
 */
export const getDirectGoogleDriveImageUrl = (url: string | null | undefined): string => {
    if (!url || !url.includes('drive.google.com')) {
        return url || ''; // Return original or empty string if not a google drive link or is null/undefined
    }

    // Regex to capture the file ID from various Google Drive URL formats
    const match = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
        const fileId = match[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return url; // Return original if the format is unexpected
};
