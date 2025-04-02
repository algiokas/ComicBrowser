export enum AppMode {
    Books = "Books",
    Videos = "Videos"
}

export enum BooksViewMode {
    Loading = "Loading",
    Listing = "Listing",
    SingleBook = "SingleBook",
    Slideshow = "Slideshow",
    SearchResults = "SearchResults"
}

export enum VideosViewMode {
    Loading = "Loading",
    Listing = "Listing",
    Actors = "Actors",
    Sources = "Sources",
    Player = "Player",
    SearchResults = "SearchResults"
}

export enum BooksSortOrder {
    Favorite = "Favorite",
    Random = "Random",
    Title = "AlphaTitle",
    Author = "AlphaAuthor",
    Artist = "AlphaArtist",
    ID = "ID",
    Date = "Date"
}

export enum VideosSortOrder {
    Favorite = "Favorite",
    Random = "Random",
    Title = "AlphaTitle",
    Actor = "AlphaActor",
    Source = "AlphaSource",
    ID = "ID",
    Date = "Date"
}

export enum ActorsSortOrder {
    ID = "ID",
    Name = "AlphaName",
    Favorite = "Favorite",
    Random = "Random",
    NumVideos = "NumVideos"
}

export enum BooksEditField {
    Title = "Title",
    Group = "Group",
    Artists = "Artists",
    Tags = "Tags",
    Prefix = "Prefix",
    HiddenPages = "HiddenPages"
}

export enum VideosEditField {
    Title = "Title",
    Source = "Source",
    Actors = "Actors",
    Tags = "Tags",
}