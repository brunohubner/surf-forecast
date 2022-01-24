import pino from "pino"
import config from "config"

export default pino({
    enabled: config.get("App.logger.enabled"),
    level: config.get("App.logger.level"),
    timestamp: () => {
        return `,"time":"${new Date(Date.now()).toLocaleTimeString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })}"`
    }
})
