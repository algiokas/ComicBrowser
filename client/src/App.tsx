import { useState } from "react";
import BooksApp from "./components/books/booksApp";
import VideosApp from "./components/videos/videosApp";
import { AppMode } from "./util/enums";

interface AppProps { } //empty

export interface SubAppProps {
  viewBooksApp(): void
  viewVideosApp(): void
}

export interface AppState {
  appMode: AppMode
}

const App = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.Videos)

  const viewBooksApp = () => {
    setAppMode(AppMode.Books)
  }

  const viewVideosApp = () => {
    setAppMode(AppMode.Videos)
  }

  const appProps: SubAppProps = {
    viewBooksApp, viewVideosApp
  }

  return (
    <div className="App">
      {
        appMode == AppMode.Books ?
          <BooksApp {...appProps}></BooksApp> :
          <VideosApp {...appProps}></VideosApp>
      }
    </div>

  )
}

export default App;
