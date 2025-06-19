import type IVideoSource from "../../../interfaces/videoSource";

interface SourceDetailProps {
    source: IVideoSource
}

const SourceDetail = (props: SourceDetailProps) => {
    return (
        <div className="sourcedetail">
            <div className="sourcedetail-header">
                <h2 className="sourcedetail-name">{props.source.name}</h2>
            </div>
            <div className="sourcedetail-inner">
                {
                    props.source.imageFileLarge ?
                    <div className="sourcedetail-image">
                        <img src={props.source.imageFileLarge}></img>
                    </div>
                    : null
                }
            </div>
        </div>
    )
}

export default SourceDetail