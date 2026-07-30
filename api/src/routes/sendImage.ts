import { Request, Response } from 'express';
import { getResizedImagePath, sanitizeWidth } from './imageResize.ts';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const IMMUTABLE_IMAGE_OPTIONS = {
    maxAge: ONE_YEAR_MS,
    immutable: true,
} as const;

/**
 * Sends an image file with aggressive, persistent cache headers.
 * Pass extra sendFile options (e.g. { root }) to merge them in.
 */
export function sendImageFile(res: Response, fpath: string, extraOptions: Record<string, unknown> = {}) {
    res.sendFile(fpath, { ...IMMUTABLE_IMAGE_OPTIONS, ...extraOptions });
}

/**
 * Sends an image, transparently serving a smaller WebP copy sized to the
 * request's ?w=<width> query when present, and falling back to the original
 * file if resizing fails. Same persistent cache headers as sendImageFile.
 */
export async function sendImage(req: Request, res: Response, fpath: string, extraOptions: Record<string, unknown> = {}) {
    let outPath = fpath;
    const width = sanitizeWidth(req.query.w);
    if (width) {
        try {
            outPath = await getResizedImagePath(fpath, width);
        } catch (err) {
            console.error(`image resize failed for ${fpath}:`, err);
        }
    }
    sendImageFile(res, outPath, extraOptions);
}
