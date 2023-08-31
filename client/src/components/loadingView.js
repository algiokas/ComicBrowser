import logo from '../logo.svg';

const LoadingView = (props) => {
    return (
        <div className="container dark-theme">
            <div className="loading-container">
                <img className="logo-pink loading-logo" src={logo} alt="Loading Logo" />
            </div>           
        </div>
    )
}

export default LoadingView;