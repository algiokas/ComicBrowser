import type { Actor } from "../types/actor";
import type { VideosAppTag } from "../types/tags";
import type { Video } from "../types/video";
import type { VideoSource } from "../types/videoSource";
import { apiBaseUrl } from "./apiClient";

async function shortNumericHash(input: string, digits = 8): Promise<number> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(buffer);

    let num = 0;
    for (let i = 0; i < 6; i++) {
        num = (num << 8) | bytes[i];
    }
    return num % (10 ** digits);
}

// Kept in sync with ALLOWED_WIDTHS in api/src/routes/imageResize.ts. Requests
// are snapped to a bucket client-side so the image URL stays stable across
// small viewport changes (no reload until a bucket boundary is crossed); the
// server snaps again as a safety net.
const THUMBNAIL_WIDTH_BUCKETS = [480, 720, 960, 1280, 1920]

/** Snap a device-pixel width up to the nearest supported thumbnail bucket. */
export function snapThumbnailWidth(deviceWidth: number): number {
    return THUMBNAIL_WIDTH_BUCKETS.find(w => w >= deviceWidth)
        ?? THUMBNAIL_WIDTH_BUCKETS[THUMBNAIL_WIDTH_BUCKETS.length - 1]
}

/**
 * Adds/replaces the ?w=<width> param on an already-built image URL so the
 * backend serves a copy sized for how it's actually rendered. Callers pass a
 * width that's already snapped to a bucket (see snapThumbnailWidth); a
 * non-positive width leaves the URL untouched (serve original).
 */
export function withThumbnailWidth(url: string, width: number): string {
    if (!url || width <= 0) return url
    try {
        const u = new URL(url, window.location.origin)
        u.searchParams.set('w', String(width))
        return u.toString()
    } catch {
        const sep = url.includes('?') ? '&' : '?'
        return `${url}${sep}w=${width}`
    }
}

export async function getVideoThumbnailUrl(video: Video): Promise<string> {
    const versionHash = await shortNumericHash(video.thumbnailId)
    return `${apiBaseUrl}/videos/thumbnail/${video.id}?v=${versionHash}`
}

export async function getActorImageUrl(actor: Actor): Promise<string> {
    const versionHash = await shortNumericHash(actor.imageFile)
    return `${apiBaseUrl}/actors/${actor.id}/image?v=${versionHash}`
}

export async function getSourceImageUrl(source: VideoSource, small?: boolean): Promise<string> {
    const versionHash = await shortNumericHash(small ? source.imageFileSmall : source.imageFileLarge)
    return `${apiBaseUrl}/videos/sources/${source.id}/image${small ? 'small' : 'large'}?v=${versionHash}`
}

export async function getTagImageUrl(tag: VideosAppTag): Promise<string> {
    if (!tag.imageFile) return ''
    const versionHash = await shortNumericHash(tag.imageFile)
    const tagTypeSegment = tag.tagType + "s"
    return `${apiBaseUrl}/${tagTypeSegment}/tags/thumbnail/${tag.id}?v=${versionHash}`
}
