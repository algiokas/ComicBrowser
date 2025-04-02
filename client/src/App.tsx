import React, { Component } from "react";
import BooksApp from "./components/books/booksApp";
import { AppMode } from "./util/enums";
import VideosApp from "./components/videos/videosApp";

interface AppProps {} //empty

export interface SubAppProps {
  toggleAppMode(): void 
}

export interface AppState {
  appMode: AppMode
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      appMode: AppMode.Books
    }
  }
  toggleAppMode = () => {
    this.setState((state) => {
      if (state.appMode == AppMode.Books) return { appMode: AppMode.Videos}
      return { appMode: AppMode.Books }
    })
  }
  render(): React.ReactNode {
    console.log('render main app')
    const appProps = {
      toggleAppMode: this.toggleAppMode
    }
    return (
      <div className="App">
        {
          this.state.appMode == AppMode.Books ? 
          <BooksApp {...appProps}></BooksApp> : 
          <VideosApp {...appProps}></VideosApp>
        }
      </div>

    )
  }
}

export default App;
