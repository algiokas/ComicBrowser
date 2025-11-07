export type VideoTag = {
    tagType: 'video'
    id: number
    name: string
    imageFile: string
}

export type ActorTag = {
    tagType: 'actor'
    id: number
    name: string
    imageFile: string
}

export type VideosAppTag = VideoTag | ActorTag