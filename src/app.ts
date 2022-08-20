import bodyParser from "body-parser";
import express, { Express } from "express";
import { useExpressServer } from "./useExpressServer";
import { Controller, Post, FromBody, Get } from "./decorators";

@Controller()
export class TestController {
  @Post()
  testPost(field: string, @FromBody anotherField: string) {
    console.log("field: ", field);
    console.log("anotherField: ", anotherField);
    return field;
  }
  @Get()
  testGet() {
    console.log("test get");
    return "TEST GET";
  }
}

const config = {
  cors: true,
  controllers: [TestController],
};

let app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

useExpressServer(app, config);
app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${8000}`);
});
