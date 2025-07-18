export interface ISearchQuery {
    filled?: boolean,
    text?: string
}

export interface IBookSearchQuery extends ISearchQuery{
    artists?: string,
    groups?: string,
    prefix?: string,
    tags?: string,
}

export interface IVideoSearchQuery extends ISearchQuery {
    actor?: string,
    source?: string,
    tag?: string,
}