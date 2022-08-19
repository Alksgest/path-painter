import bodyParser from "body-parser";
import express, { Express } from "express";
import { useExpressServer } from "./useExpressServer";
import { Controller, Post, FromBody, Get } from "./decorators";
import { createServer } from "http";
import cors from "cors";

@Controller()
export class TestController {
  @Post()
  testPost(@FromBody fiel: string) {
    return fiel;
  }
  @Get()
  testGet() {
    console.log("test get");
    return "TEST GET";
  }
}

const config = {
  controllers: [TestController],
};

let app: Express = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

useExpressServer(app, config);
app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${8000}`);
});
