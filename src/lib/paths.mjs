// Photo paths are relative to content/media; the editor may write "/content/media/x.webp" or "/x.webp".
export const mediaPath = src => src.replace(/^\/+/, '').replace(/^content\/media\//, '');
// Size limits that keep the repository and the Pages site small.
export const MEDIA_MAX_BYTES = 600 * 1024;
export const MEDIA_MAX_EDGE = 2400;
