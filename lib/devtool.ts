export function consoleLogObject(item: any, options: any = { depth: null, colors: true }, enable: boolean = false) {
    if (enable) {
        console.dir(item, options)
    }
}