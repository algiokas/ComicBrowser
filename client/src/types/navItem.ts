export type NavItem = {
    text: string,
    viewMode?: string,
    counter?: number,
    clickHandler: (...params: any[]) => void,
    displayCheck?: (...params: any[]) => boolean
}