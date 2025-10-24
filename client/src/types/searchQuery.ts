export type BaseSearchQuery = {
    filled?: boolean,
    text?: string
}

export type IBookSearchQuery = BaseSearchQuery & {
    artists?: string,
    groups?: string,
    prefix?: string,
    tags?: string,
}

export type IVideoSearchQuery = BaseSearchQuery & {
    actor?: string,
    source?: string,
    tag?: string,
}