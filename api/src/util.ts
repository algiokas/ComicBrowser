export  function stripNonAlphanumeric(str: string) {
    return str.replace(/\W/g, '')
}