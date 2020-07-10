const fs = require('fs')

const data = fs.readFileSync(__dirname + '/test-batch.csv').toString().split('\r')
let prevName, headerRow;
const scrubbed = []
let correspondingRow;
let currIndex = 0
let i = -1

// cell         = currenct cell
// currIndex    = currenct row index
// i            = last row pushed to scrubbed
// j            = current column





function handleInteractionMerges(i, j, curr) {
    const currCell = curr[j]
    const firstInteraction = headerRow[j].includes("First Interaction")
    const lastInteraction = headerRow[j].includes("Last Interaction")
    const interactionScore = headerRow[j].includes("Score")
    let sm, lg;

    // if none present, skip.
    if (!firstInteraction && !lastInteraction && !interactionScore) {
        return false
    }

    // find direction/type
    const directionOrtype = headerRow[j].includes("Direction") || headerRow[j].includes("Type") ? true : false

    if (firstInteraction) {
        if (directionOrtype) {
                                    // mainlist[detailsINeed].correctForUnwantedCharacters 
            const rowForInteractions = data[correspondingRow].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            scrubbed[i][j] = rowForInteractions[j] ? rowForInteractions[j] : scrubbed[i][j] // use correct direction
        }
        else { // find smallest number
            sm = Math.min(scrubbed[i][j], currCell) // use smallest number
            // find corresponding row
            correspondingRow = scrubbed[i][j] < currCell ? currIndex - 1 : currIndex
            // Apply correct date/score to scrubbed
            // if sm is truthy use sm otherwiase use lg
            scrubbed[i][j] = sm ? sm : lg
        }
    }
    else {
        if (directionOrtype) {
                                    // mainlist[detailsINeed].correctForUnwantedCharacters 
            const rowForInteractions = data[correspondingRow].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            scrubbed[i][j] = rowForInteractions[j] ? rowForInteractions[j] : scrubbed[i][j] // use correct direction
        }
        
        else { // use largest number
            lg = Math.max(scrubbed[i][j], currCell) 
            // find corresponding row
            correspondingRow = scrubbed[i][j] > currCell ? currIndex - 1 : currIndex
            // Apply correct date/score to scrubbed
            // if sm is truthy use sm otherwiase use lg
            scrubbed[i][j] = sm ? sm : lg
        }
    }
    return true
}





function handleDupNamedRows(i, curr) {
    const prev = scrubbed[i]    // last uniquely named row
    let j = -1                   // column

    for (cell of curr) {
        ++j

        if (prev[j] !== cell) { // unique
            
            if (prev[j].length && cell.length) { // neither empty - merge
                
                if (handleInteractionMerges(i, j, curr)) continue

                // if cells are not "interaction types" continue to merge
                scrubbed[i][j] = `"${scrubbed[i][j]}, ${cell}"`
            }
            else if (!prev[j].length) {  // prev empty - use curr
                scrubbed[i][j] = cell
            }
            // curr empty - nothing. defaults to prev
        }
        /*  At this point both either empty or same value - do nothing. Defaults to prev  */
    }
}





for (currRow of data) {
    
    // create array of cells
    const currArrayOfCells = currRow.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    const currName = currArrayOfCells[0]

    // record headerRow to compare Interaction merges
    !headerRow && (headerRow = currArrayOfCells)
    
    if (prevName === currName) {
        handleDupNamedRows(i, currArrayOfCells)

        // skip pushing this row b/c duplicate
        // reset so it can't have duplicate on next loop
        prevArrayOfCells = ''               
        prevName = ''                                    
    }
    else {
        scrubbed.push(currArrayOfCells)                 // push only if currRow not same name
        prevArrayOfCells = currArrayOfCells             // set prev to current cells
        prevName = currName                             // set prev to current name
        ++i
    }
    ++currIndex                                         // increment on each row no matter circumstances
}

console.log(`Removed ${data.length - scrubbed.length} rows!`, data.length, scrubbed.length)
    
fs.writeFile(__dirname + '/scrubbed/no-dups.csv', scrubbed, 'utf8', () => { console.log("Complete!") })
    