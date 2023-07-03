"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const csv_parser_1 = __importDefault(require("csv-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const { csvFiles, directoryPath } = worker_threads_1.workerData;
csvFiles.forEach((csvFile) => {
    const csvFilePath = path_1.default.join(directoryPath, csvFile);
    const jsonFilePath = path_1.default.join("converted", `${path_1.default.parse(csvFile).name}.json`);
    let recordCount = 0;
    const records = [];
    fs_1.default.createReadStream(csvFilePath)
        .pipe((0, csv_parser_1.default)())
        .on("data", (data) => {
        records.push(data);
        recordCount++;
    })
        .on("end", () => {
        fs_1.default.writeFile(jsonFilePath, JSON.stringify(records, null, 2), (err) => {
            if (err) {
                console.error("Error writing JSON file:", err);
            }
        });
        if (worker_threads_1.parentPort) {
            worker_threads_1.parentPort.postMessage({ recordCount });
        }
    });
});
