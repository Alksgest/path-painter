import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import { useExpressServer } from "./useExpressServer";
import {
  Controller,
  Post,
  FromBody,
  Get,
  FromHeader,
  FromQuery,
  FromParam,
  UseBefore,
  UseAfter,
} from "./decorators";
import { IExpressMiddleware } from "./types/web";

class TestMiddleware implements IExpressMiddleware {
  use(request: Request, response: Response, next: (err?: any) => any) {
    console.log("Hello from middleware!");

    if (next) {
      next();
    }
  }
}

class TestControllerMiddleware implements IExpressMiddleware {
  use(request: Request, response: Response, next: (err?: any) => any) {
    console.log("Hello from controller middleware!");

    if (next) {
      next();
    }
  }
}

@UseAfter(TestControllerMiddleware)
@UseBefore(TestControllerMiddleware)
@Controller("/test")
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

  @UseAfter(TestMiddleware)
  @UseBefore(TestMiddleware)
  @Get("/byId/:id")
  testGetWithParam(@FromParam("id") id: string) {
    console.log("controller method invoke!");
    return Promise.resolve(id);
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

// app.use("/test", (req, res, next) => {
//   console.log("test middleware");
//   next();
// });

app.listen(8000, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${8000}`);
});

//TODO: remove default usage of body parser as middleware
//TODO: add file receiving
