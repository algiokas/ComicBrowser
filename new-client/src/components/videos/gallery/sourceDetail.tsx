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
        </div>
    )
}