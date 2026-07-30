import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = process.env.IMAGE_CACHE_DIR
    ?? (process.env.VIDEOS_DATA_DIR
        ? path.join(process.env.VIDEOS_DATA_DIR, 'images', 'resized')
        : path.join(process.cwd(), '.image-cache'));

// Buckets chosen to cover the galleries' rendered sizes across device pixel
// ratios: tag/mass-tagger tiles (~477 CSS px) and video/actor/source tiles
// (~607 CSS px), each times a 1x-2x DPR. Snapping requests to this small set
// keeps the derived-image cache from exploding across arbitrary widths.
//   477 -> 480 (1x) / 720 (1.5x) / 960 (2x)
//   607 -> 720 (1x) / 960 (1.5x) / 1280 (2x)
const ALLOWED_WIDTHS = [480, 720, 960, 1280, 1920];

const inFlight = new Map<string, Promise<string>>();

/**
 * Clamp/snap a requested width to the nearest allowed width >= the request
 * (capped at the largest allowed). Returns null for missing/invalid input,
 * meaning "serve the original".
 */
export function sanitizeWidth(raw: unknown): number | null {
    const n = Number(raw);
    if (!raw || isNaN(n) || n <= 0) return null;
    return ALLOWED_WIDTHS.find(w => w >= n) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/**
 * Returns a path to a WebP-encoded, width-constrained copy of sourcePath,
 * generating and caching it on first request. The cache key includes the
 * source path, mtime and size, so replacing the source file in place produces
 * a fresh derivative. Images are never enlarged past their native width.
 */
export function getResizedImagePath(sourcePath: string, width: number): Promise<string> {
    let stat: fs.Stats;
    try {
        stat = fs.statSync(sourcePath);
    } catch (err) {
        return Promise.reject(err);
    }

    const key = crypto.createHash('sha1')
        .update(`${sourcePath}|${stat.mtimeMs}|${stat.size}|w${width}|webp`)
        .digest('hex');
    const outPath = path.join(CACHE_DIR, `${key}.webp`);

    if (fs.existsSync(outPath)) return Promise.resolve(outPath);

    const existing = inFlight.get(outPath);
    if (existing) return existing;

    const job = (async () => {
        await fs.promises.mkdir(CACHE_DIR, { recursive: true });
        // Write to a unique temp file then atomically rename, so a partially
        // written file is never served.
        const tmpPath = `${outPath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
        await sharp(sourcePath)
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(tmpPath);
        await fs.promises.rename(tmpPath, outPath);
        return outPath;
    })().finally(() => inFlight.delete(outPath));

    inFlight.set(outPath, job);
    return job;
}
