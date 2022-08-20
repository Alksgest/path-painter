import bodyParser from "body-parser";
import express, { Express } from "express";
import { useExpressServer } from "./useExpressServer";
import {
  Controller,
  Post,
  FromBody,
  Get,
  FromHeader,
  FromQuery,
  FromParam,
  _FromParam,
} from "./decorators";

@Controller()
export class TestController {
  @Post()
  testPost(
    @FromQuery param1: string,
    @FromHeader field: string,
    @FromBody anotherField: string
  ) {
    console.log("param1: ", param1);
    console.log("field: ", field);
    console.log("anotherField: ", anotherField);
    return field;
  }
  @Get()
  testGet() {
    console.log("test get");
    return "TEST GET";
  }
  @Get("byId/:id")
  testGetWithParam(@_FromParam("id") id: string) {
    return id;
  }
}

const config = {
  cors: true,
  controllers: [TestController],
};

let app: Express = express();

// app.get("*", (req, res) => {
//   console.log("req.params: ", req.params);
//   res.send();
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

useExpressServer(app, config);
app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${8000}`);
});
