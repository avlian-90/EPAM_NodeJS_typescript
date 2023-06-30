import path from "path";
import fs from "fs";
import { Worker } from "worker_threads";


export default class Converter {
    directoryPath: string;

    constructor(directoryPath: string) {
        this.directoryPath = directoryPath;
    }

    start(): object {
        return new Promise<void>((resolve, reject) => {
            
            fs.readdir(this.directoryPath, (err, files) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }

                const csvFiles: string[] = files.filter((file) => path.extname(file).toLowerCase() === ".csv");

                if (csvFiles.length === 0) {
                    console.error("No CSV files!");
                    reject(new Error("No CSV files!"));
                    return;
                }

                const filesCount: number = csvFiles.length;
                const startTime: any = new Date();

                const workersCount: number = filesCount < 10 ? filesCount : 10;
                const recordsPerWorker: number = Math.ceil(filesCount / workersCount);

                let completedWorkers: number = 0;
                let overallDuration: number = 0;
                let ovearallRecordCount: number = 0;

                for (let i = 0; i < workersCount; i++) {
                    const start: number = i * recordsPerWorker;
                    const end: number = start + recordsPerWorker;

                    const worker = new Worker("./dist/worker.js", {
                        workerData: {
                            directoryPath: this.directoryPath,
                            csvFiles: csvFiles.slice(start, end)
                        }
                    })

                    worker.on("message", (message) => {

                        const endTime: any = new Date();
                        const duration: number = endTime - startTime;
                        overallDuration += duration;
                        ovearallRecordCount += message.recordCount;
                            
                
                        completedWorkers ++;
                
                        if (completedWorkers === workersCount) {
                            console.log(`Total record count: ${ovearallRecordCount}. Duration: ${overallDuration}ms`); 
                            resolve();
                        }
                    });
                
                    worker.on("error", (err) => {
                        console.error(err);
                        reject(err);
                    });

                    worker.on("exit", (code: number):void => {
                        if (code !== 0) {
                            const errorMessage: string = `Worker stopped with exit code ${code}`;
                            console.error(errorMessage);
                            reject(new Error(errorMessage));
                        }
                    });
                }
            })       
        })
    }
}



  