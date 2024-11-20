export interface IBookSearchQuery {
    filled?: boolean,
    artist?: string,
    group?: string,
    prefix?: string,
    tag?: string,
}

export interface IVideoSearchQuery {
    filled?: boolean,
    actor?: string,
    source?: string,
    tag?: string,
}