const languages = ["Japanese", "English", "Chinese", "Translated"]

exports.getFileName = function(id, book) {
    return String(id).padStart(4, '0') + ' - ' + book.title
}

exports.folderToJSON = function(folderName, contents, id) {
    let output = {}
    if (!folderName || !contents || contents.length < 1) {
        return 
    }
    if (id > 0) {
        output.id = id
    }
    output.folderName = folderName
    if (folderName[0] == '(')
        output.prefix = folderName.substring(1, folderName.indexOf(')', 1))
    else
        output.prefix = ""

    let artistGroupStart = folderName.indexOf('[', 0)
    let artistGroupEnd = folderName.indexOf(']', artistGroupStart)
    let artistGroupString = folderName.substring(artistGroupStart+1, artistGroupEnd)

    let artistStart = artistGroupString.indexOf('(')
    if (artistStart < 0) {
        output.artists = artistGroupString.split(',')
        output.group = ""
    }
    else {
        output.group = artistGroupString.substring(0, artistStart).trim()
        output.artists = artistGroupString.substring(artistStart+1, artistGroupString.indexOf(')')).split(',')
    }

    let titleStart = artistGroupEnd+1
    let suffixRegex = /\([^)]*\)|\[[^\]]*\]|\{[^\]]*\}/g;
    let suffixItems = folderName.substring(titleStart).match(suffixRegex)
    if (suffixItems && suffixItems.length > 0) {
        let tagsTemp = []
        suffixItems.forEach((item) => {
            let itemValue = item.substring(1, item.length-1)
            if (languages.includes(itemValue)) {
                output.language = itemValue
            } else {
                tagsTemp.push(itemValue)
            }
        })
        output.tags = tagsTemp

        let suffixStart = folderName.indexOf(suffixItems[0])-1
        output.title = folderName.substring(titleStart, suffixStart).trim()

    }
    else {
        output.title = folderName.substring(titleStart).trim()
    }

    output.pageCount = contents.length
    output.cover = contents[0]
    output.pages = contents

    return output
}