import {workerData, parentPort} from "worker_threads"
import csv from "csv-parser"
import path from "path";
import fs from "fs"


const { csvFiles, directoryPath } = workerData;

csvFiles.forEach((csvFile: string) => {

    const csvFilePath: string = path.join(directoryPath, csvFile);
    const jsonFilePath: string = path.join("converted", `${path.parse(csvFile).name}.json`);

    let recordCount: number = 0;
    const records: object[] = [];

    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (data: object) => {
        records.push(data);
        recordCount++;
        })
        .on("end", () => {
        fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2), (err) => {
            if (err) {
            console.error("Error writing JSON file:", err);
            }
        });

        if(parentPort) {
            parentPort.postMessage({ recordCount });
        }
        });
});

