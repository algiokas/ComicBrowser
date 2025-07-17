import { SourceRow } from "./types/video"

export const PLACEHOLDER_SOURCE: SourceRow = {
    id: -1,
    imageFileSmall: null,
    imageFileLarge: null,
    siteUrl: null,
    name: 'MISSING_SOURCE',
}

export function stripNonAlphanumeric(str: string) {
    return str.replace(/\W/g, '')
}

export function wrapQuotes(str: string) {
    return '"' + str + '"'
}

export function getTimestampString(timeMs: string) {
    var baseTime = new Date(0)
    var msTime = new Date(parseInt(timeMs))

    var hours = String(msTime.getHours() - baseTime.getHours())
    var mins = String(msTime.getMinutes() - baseTime.getMinutes())
    var seconds = String(msTime.getSeconds() - baseTime.getSeconds())
    var milliseconds = String(msTime.getMilliseconds() - baseTime.getMilliseconds())

    return hours.padStart(2, '0') + ":" + mins.padStart(2, '0') + ":" + seconds.padStart(2, '0') + "." + milliseconds
}