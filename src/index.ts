import { createServer } from "http";
import path from "path";
import fs from "fs";
import Converter from "./converter";

const server = createServer((req, res) => {
    if (req.method === "POST" && req.url === "/exports") {
      handleExportRequest(req, res);
    } else if (req.method === "GET" && req.url === "/files") {
      handleGetFilesRequest(req, res);
    } else if (req.method === "GET" && req.url?.startsWith("/files/")) {
      handleGetFileRequest(req, res);
    } else if (req.method === "DELETE" && req.url?.startsWith("/files/")) {
      handleDeleteFileRequest(req, res);
    } else {
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.end("Not Found");
    }
  });
  
  function handleExportRequest(req: any, res: any):void {
    let body: string = "";
  
    req.on("data", (chunk: string) => {
      body += chunk;
    });
  
    req.on("end", async () => {
      try {
        const requestBody = JSON.parse(body);
        const { directoryPath } = requestBody;
  
        if (!directoryPath) {
          res.statusCode = 400;
          res.end("Directory Path is required");
          return;
        }
  
        const converter = new Converter("csv-files");
        await converter.start();
  
        res.statusCode = 200;
        res.end("CSV files are converted and saved successfully");
      } catch (error) {
        console.error("Error", error);
        res.statusCode = 500;
        res.end("Server Error");
      }
    });
  }
  
  function handleGetFilesRequest(req: any, res: any):void {
    try {
      const jsonFiles: string[] = fs.readdirSync("converted");
  
      res.writeHead(200, {"Content-Type": "application/json"});
    
      res.end(JSON.stringify(jsonFiles));
    } catch (error) {
      console.error("Error", error);
      res.statusCode = 500;
      res.end("Server Error");
    }
  }
  
  function handleGetFileRequest(req: any, res: any):void {
    const fileName: string = req.url.split("/")[2].split(":")[1] + ".json";
    const filePath: string = path.join("converted", fileName);
  
    try {
      if (fs.existsSync(filePath)) {
        const fileContent: string = fs.readFileSync(filePath, "utf8");
  
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(fileContent);
      } else {
        res.statusCode = 404;
        res.end("File is not found");
      }
    } catch (error) {
      console.error("Error", error);
      res.statusCode = 500;
      res.end("Server Error");
    }
  }
  
  function handleDeleteFileRequest(req: any, res: any):void {
    const fileName: string = req.url.split("/")[2].split(":")[1] + ".json";
    const filePath: string = path.join("converted", fileName);
  
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.statusCode = 200;
        res.end("File is deleted");
      } else {
        res.statusCode = 404;
        res.end("File is not found");
      }
    } catch (error) {
      console.error("Error", error);
      res.statusCode = 500;
    res.end("Server Error");
  }
}

server.listen(3001, ():void => {
    console.log("Server starts!")
});

