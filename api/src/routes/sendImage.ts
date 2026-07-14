import { Response } from 'express';

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
