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
