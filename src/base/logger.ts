namespace C {
    export class MarkitLogger {
        debugLevel = -1
        warn(position: string, message: string|any) {
            if (typeof message === "string") {
                console.warn(`Markit-debug-${position}: ${message}`)
            } else {
                console.warn(`Markit-debug-${position}: `, message)
            }
        }

        setDebugLevel(value: number) {
            this.debugLevel = value
        }
        debug(position: string, message: string | any, debugLevel=0) {
            if (this.debugLevel>=debugLevel) {
                if (typeof message === "string") {
                    console.debug(`Markit-debug-${position}: ${message}`)
                } else {
                    console.debug(`Markit-debug-${position}: `, message)
                }
            }
        }

        throw(position: string, throwMessage: string) {
            throw `Markit-${position}: ${throwMessage}`
        }
    }
}


export const MarkitLogger = new C.MarkitLogger()