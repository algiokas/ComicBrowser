import { spawn } from 'child_process';
import path from 'path';
import { ActorRow, ClientActor, ClientVideo, VideoRow } from './types/video';

export interface VideoScreenshotOptions {
    timestamp?: string;
    outputDir?: string;
    outputFileName?: string;
}

export interface GenerateThumbnailResult {
    success: boolean,
    video?: VideoRow | ClientVideo,
    actor?: ActorRow | ClientActor
}

export function generateImageFromVideo(videoPath: string, options: VideoScreenshotOptions, callback: () => void): void {
    if (!options.timestamp) {
        console.log(`generateImageFromVideo - no timestamp provided`)
        return callback() 
    }

    if (!options.outputDir) {
        console.error(`generateImageFromVideo - no output directory provided`)
        return callback()    
    }

    if (!options.outputFileName) {
        console.error(`generateImageFromVideo - no output file name provided`)
        return callback()
    }

    const outputFullPath = path.join(options.outputDir, options.outputFileName);

    const newArgs = [
        '-ss', options.timestamp,
        '-i', videoPath,
        '-y',
        '-filter_complex', 'scale=w=trunc(iw*1/2)*2:h=trunc(ih*1/2)*2[size0];[size0]split=1[screen0]',
        '-vframes', '1',
        '-map', '[screen0]',
        `${outputFullPath}.png`
    ]

    const ffmpeg = spawn('ffmpeg', newArgs);

    ffmpeg.stderr.on('data', (data) => {
        // ffmpeg writes progress/errors to stderr
        console.error(`[ffmpeg] ${data}`);
    });

    ffmpeg.on('close', (code) => {
        if (code === 0) {
            return callback();
        } else {
            console.error(`ffmpeg exited with code ${code}`);
        }
    });
}