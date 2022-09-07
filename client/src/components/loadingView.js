import logo from '../logo.svg';

const LoadingView = (props) => {
    return (
        <div className="container index-container dark-theme">
            <div className="loading-container">
                <img className="logo-pink" src={logo} alt="Loading Logo" />
            </div>           
        </div>
    )
}

export default LoadingView;