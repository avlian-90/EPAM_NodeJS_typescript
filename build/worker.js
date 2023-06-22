import { workerData, parentPort } from "worker_threads";
import csv from "csv-parser";
import path from "path";
import fs from "fs";
const { csvFiles, directoryPath } = workerData;
csvFiles.forEach((csvFile) => {
    const csvFilePath = path.join(directoryPath, csvFile);
    const jsonFilePath = path.join("converted", `${path.parse(csvFile).name}.json`);
    let recordCount = 0;
    const records = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on("data", (data) => {
        records.push(data);
        recordCount++;
    })
        .on("end", () => {
        fs.writeFile(jsonFilePath, JSON.stringify(records, null, 2), (err) => {
            if (err) {
                console.error("Error writing JSON file:", err);
            }
        });
        if (parentPort) {
            parentPort.postMessage({ recordCount });
        }
    });
});
