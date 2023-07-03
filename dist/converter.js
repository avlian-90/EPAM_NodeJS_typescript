"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const worker_threads_1 = require("worker_threads");
class Converter {
    constructor(directoryPath) {
        this.directoryPath = directoryPath;
    }
    start() {
        return new Promise((resolve, reject) => {
            fs_1.default.readdir(this.directoryPath, (err, files) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                const csvFiles = files.filter((file) => path_1.default.extname(file).toLowerCase() === ".csv");
                if (csvFiles.length === 0) {
                    console.error("No CSV files!");
                    reject(new Error("No CSV files!"));
                    return;
                }
                const filesCount = csvFiles.length;
                const startTime = new Date();
                const workersCount = filesCount < 10 ? filesCount : 10;
                const recordsPerWorker = Math.ceil(filesCount / workersCount);
                let completedWorkers = 0;
                let overallDuration = 0;
                let ovearallRecordCount = 0;
                for (let i = 0; i < workersCount; i++) {
                    const start = i * recordsPerWorker;
                    const end = start + recordsPerWorker;
                    const worker = new worker_threads_1.Worker("./dist/worker.js", {
                        workerData: {
                            directoryPath: this.directoryPath,
                            csvFiles: csvFiles.slice(start, end)
                        }
                    });
                    worker.on("message", (message) => {
                        const endTime = new Date();
                        const duration = endTime - startTime;
                        overallDuration += duration;
                        ovearallRecordCount += message.recordCount;
                        completedWorkers++;
                        if (completedWorkers === workersCount) {
                            console.log(`Total record count: ${ovearallRecordCount}. Duration: ${overallDuration}ms`);
                            resolve();
                        }
                    });
                    worker.on("error", (err) => {
                        console.error(err);
                        reject(err);
                    });
                    worker.on("exit", (code) => {
                        if (code !== 0) {
                            const errorMessage = `Worker stopped with exit code ${code}`;
                            console.error(errorMessage);
                            reject(new Error(errorMessage));
                        }
                    });
                }
            });
        });
    }
}
exports.default = Converter;
