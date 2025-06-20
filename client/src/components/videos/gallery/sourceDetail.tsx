import { useEffect, useState } from "react";
import type IVideoSource from "../../../interfaces/videoSource";
import { getSourceImageUrl } from "../../../util/helpers";

interface SourceDetailProps {
    source: IVideoSource,
    uploadSourceImage(sourceId: number, imageSize: 'small' | 'large', fileData: any): void
}

export interface FileWithData {
    file: File,
    data: ArrayBuffer
}

const SourceDetail = (props: SourceDetailProps) => {
    const [ currentFile, setCurrentFile ] = useState<FileWithData | null>(null)
    useEffect(() => {
        console.log(JSON.stringify(props.source))
    }, [ props.source ])

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

    const uploadSmall = () => {
        props.uploadSourceImage(props.source.id, 'small', currentFile)
    }

    const uploadLarge = () => {
        props.uploadSourceImage(props.source.id, 'large', currentFile)
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
                        <img src={getSourceImageUrl(props.source)}></img>
                    </div>
                    : null
                }
                <div className="sourcedetail-upload">
                    <input type="file" name="imageLarge" accept="image/*" onChange={handleFileChange}/>
                    <button type="button" onClick={() => uploadSmall()}>Upload Small</button>
                    <button type="button" onClick={() => uploadLarge()}>Upload Large</button>
                </div>
            </div>
        </div>
    )
}

export default SourceDetail