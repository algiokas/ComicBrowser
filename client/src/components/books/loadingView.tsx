import Logo from '../logo.svg';

interface loadingViewProps{}

const LoadingView = (props: loadingViewProps) => {
    return (
        <div className="container dark-theme">
            <div className="loading-container">
                {/* <Logo className="logo-pink loading-logo" /> */}
            </div>           
        </div>
    )
}

export default LoadingView;