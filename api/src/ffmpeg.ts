import { spawn } from 'child_process';
import path from 'path';
import { ActorRow, ClientActor, ClientVideo, VideoRow } from './types/video';
import { timeStamp } from 'console';

const dataDir = process.env.VIDEOS_DATA_DIR!
const actorImageDir = path.join(dataDir, '/images/actors')
const sourceImageDir = path.join(dataDir, '/images/sources')
const thumbnailDir = path.join(dataDir, '/images/thumbnails')

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

    const args = [
        '-ss', options.timestamp,          // Seek to timestamp
        '-i', videoPath,           // Input file
        '-frames:v', '1',          // Capture 1 frame
        '-q:v', '3',               // Quality level
        '-vf', 'scale=iw:ih',      // Scale to 100% (identity)
        `${outputFullPath}.png`             // Output path
    ];

    const ffmpeg = spawn('ffmpeg', args);

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