


const parsePathData = (d) => {
    if (!d) return []
    const commands = []
    const regex = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;

    let match
    let currentCommand = null
    let params = []

    const pushCommand = () => {
        if (currentCommand) {
            commands.push({command: currentCommand, params: [...params]})
            params = []
        }
    }

    while ((match = regex.exec(d)) !== null) {
        if (match[1]) {
            const cmd = match[1]

            if (currentCommand && params.length > 0) {
                pushCommand()
            } else if (currentCommand && currentCommand.toUpperCase() === "Z") {
                commands.push({command: currentCommand, params: []})
            }

            currentCommand = cmd

            if (currentCommand.toUpperCase() === "Z") {
                commands.push({command: currentCommand, params: []})
                currentCommand = null
            }
        } else if (currentCommand) {
            params.push(parseFloat(match[2]))
        }
    }
    if (currentCommand && params.length > 0) {
        pushCommand()
    } else if (currentCommand  && currentCommand.toUpperCase() === 'Z') {
        commands.push({command: currentCommand, params: []})
    }

    return commands
}

export default parsePathData