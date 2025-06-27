import { useContext, useEffect, useState } from "react";
import type IVideoSource from "../../../interfaces/videoSource";
import { getSourceImageUrl } from "../../../util/helpers";
import { VideosAppContext } from "../videosAppContext";

interface SourceDetailProps {
    source: IVideoSource,
}

export interface FileWithData {
    file: File,
    data: ArrayBuffer
}

const SourceDetail = (props: SourceDetailProps) => {
    const [currentFile, setCurrentFile] = useState<FileWithData | null>(null)
    const [primaryImageUrl, setPrimaryImageUrl] = useState<string>('')

    const appContext = useContext(VideosAppContext)

    useEffect(() => {
        const updatePrimaryImage = async () => {
            const thumbnailUrl = await getSourceImageUrl(props.source)
            setPrimaryImageUrl(thumbnailUrl)
        }
        updatePrimaryImage()
    }, [props.source])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const primaryFile = e.target.files[0]
            if (primaryFile) {
                const reader = new FileReader()
                reader.onload = () => {
                    const arrBuffer = reader.result as ArrayBuffer
                    setCurrentFile({ file: primaryFile, data: arrBuffer })
                }
                reader.readAsArrayBuffer(primaryFile)
            }
        }
    }

    const upload = (imageSize: 'small' | 'large') => {
        if (currentFile) {
            appContext.uploadSourceImage(props.source.id, imageSize, currentFile)
        }
    }

    return (
        <div className="sourcedetail">
            <div className="sourcedetail-header">
                <h2 className="sourcedetail-name">{props.source.name}</h2>
            </div>
            <div className="sourcedetail-inner">
                {
                    props.source.imageFileLarge ?
                        <div className="sourcedetail-image">
                            <img src={primaryImageUrl}></img>
                        </div>
                        : null
                }
                <div className="sourcedetail-upload">
                    <input type="file" name="imageLarge" accept="image/*" onChange={handleFileChange} />
                    <button type="button" onClick={() => upload('small')}>Upload Small</button>
                    <button type="button" onClick={() => upload('large')}>Upload Large</button>
                </div>
            </div>
        </div>
    )
}

export default SourceDetail