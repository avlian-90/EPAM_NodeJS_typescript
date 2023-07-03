var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createServer } from "http";
import path from "path";
import fs from "fs";
import Converter from "./converter";
const server = createServer((req, res) => {
    var _a, _b;
    if (req.method === "POST" && req.url === "/exports") {
        handleExportRequest(req, res);
    }
    else if (req.method === "GET" && req.url === "/files") {
        handleGetFilesRequest(req, res);
    }
    else if (req.method === "GET" && ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/files/"))) {
        handleGetFileRequest(req, res);
    }
    else if (req.method === "DELETE" && ((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith("/files/"))) {
        handleDeleteFileRequest(req, res);
    }
    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});
function handleExportRequest(req, res) {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const requestBody = JSON.parse(body);
            const { directoryPath } = requestBody;
            if (!directoryPath) {
                res.statusCode = 400;
                res.end("Directory Path is required");
                return;
            }
            const converter = new Converter("csv-files");
            yield converter.start();
            res.statusCode = 200;
            res.end("CSV files are converted and saved successfully");
        }
        catch (error) {
            console.error("Error", error);
            res.statusCode = 500;
            res.end("Server Error");
        }
    }));
}
function handleGetFilesRequest(req, res) {
    try {
        const jsonFiles = fs.readdirSync("converted");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonFiles));
    }
    catch (error) {
        console.error("Error", error);
        res.statusCode = 500;
        res.end("Server Error");
    }
}
function handleGetFileRequest(req, res) {
    const fileName = req.url.split("/")[2].split(":")[1] + ".json";
    const filePath = path.join("converted", fileName);
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf8");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(fileContent);
        }
        else {
            res.statusCode = 404;
            res.end("File is not found");
        }
    }
    catch (error) {
        console.error("Error", error);
        res.statusCode = 500;
        res.end("Server Error");
    }
}
function handleDeleteFileRequest(req, res) {
    const fileName = req.url.split("/")[2].split(":")[1] + ".json";
    const filePath = path.join("converted", fileName);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.statusCode = 200;
            res.end("File is deleted");
        }
        else {
            res.statusCode = 404;
            res.end("File is not found");
        }
    }
    catch (error) {
        console.error("Error", error);
        res.statusCode = 500;
        res.end("Server Error");
    }
}
server.listen(3001, () => {
    console.log("Server starts!");
});
