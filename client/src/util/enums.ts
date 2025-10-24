export const AppMode = {
  Books: "Books",
  Videos: "Videos",
} as const;
export type AppMode = (typeof AppMode)[keyof typeof AppMode];

export const BooksViewMode = {
  Loading: "Loading",
  Listing: "Listing",
  SingleBook: "SingleBook",
  Slideshow: "Slideshow",
  Collections: "Collections",
  SearchResults: "SearchResults",
} as const;
export type BooksViewMode = (typeof BooksViewMode)[keyof typeof BooksViewMode];

export const VideosViewMode = {
  Loading: "Loading",
  Listing: "Listing",
  Actors: "Actors",
  Sources: "Sources",
  Player: "Player",
  Tags: "Tags",
  SearchResults: "SearchResults",
} as const;
export type VideosViewMode = (typeof VideosViewMode)[keyof typeof VideosViewMode];

export const BooksSortOrder = {
  Favorite: "Favorite",
  Random: "Random",
  Title: "AlphaTitle",
  Author: "AlphaAuthor",
  Artist: "AlphaArtist",
  ID: "ID",
  Date: "Date",
} as const;
export type BooksSortOrder = (typeof BooksSortOrder)[keyof typeof BooksSortOrder];

export const VideosSortOrder = {
  Favorite: "Favorite",
  Random: "Random",
  Title: "AlphaTitle",
  Actor: "AlphaActor",
  Source: "AlphaSource",
  ID: "ID",
  Date: "Date",
} as const;
export type VideosSortOrder = (typeof VideosSortOrder)[keyof typeof VideosSortOrder];

export const ActorsSortOrder = {
  ID: "ID",
  Name: "AlphaName",
  Favorite: "Favorite",
  Random: "Random",
  NumVideos: "NumVideos",
} as const;
export type ActorsSortOrder = (typeof ActorsSortOrder)[keyof typeof ActorsSortOrder];

export const BooksEditField = {
  Title: "Title",
  Group: "Group",
  Artists: "Artists",
  Tags: "Tags",
  Prefix: "Prefix",
  HiddenPages: "HiddenPages",
} as const;
export type BooksEditField = (typeof BooksEditField)[keyof typeof BooksEditField];

export const VideosEditField = {
  Title: "Title",
  Source: "Source",
  Actors: "Actors",
  Tags: "Tags",
} as const;
export type VideosEditField = (typeof VideosEditField)[keyof typeof VideosEditField];

export const ActorsEditField = {
  Name: "Name",
  BirthYear: "BirthYear",
  Tags: "Tags",
} as const;
export type ActorsEditField = (typeof ActorsEditField)[keyof typeof ActorsEditField];

export type EditField = VideosEditField | ActorsEditField

export const TagType = {
  Video: "Video",
  Actor: "Actor"
} as const;
export type TagType = (typeof TagType)[keyof typeof TagType];