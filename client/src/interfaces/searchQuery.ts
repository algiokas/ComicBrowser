export interface IBookSearchQuery {
    filled?: boolean,
    artists?: string,
    groups?: string,
    prefix?: string,
    tags?: string,
    text?: string
}

export interface IVideoSearchQuery {
    filled?: boolean,
    actor?: string,
    source?: string,
    tag?: string,
}