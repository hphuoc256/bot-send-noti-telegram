module.exports = {
    apps: [{
        name: "Telegram Amplitude",
        script: "./index.js",
        instances: 1,
        exec_mode: "cluster",
        watch: false,
        max_memory_restart: "150M"
    }]
}
