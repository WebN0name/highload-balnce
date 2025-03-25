const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const numWorkers = Math.min(4, os.cpus().length);
    console.log(`Запуск ${numWorkers} процессов...`);

    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} завершился, перезапускаем...`);
        cluster.fork();
    });
} else {
    require('./app.js');
}