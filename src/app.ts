import { Request, Response } from "express";
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseBefore,
  UseAfter,
} from "./decorators";
import { ControllerBaseConfig } from "./types/settings";
import { IMiddleware } from "./types/web";
import { AppContainer } from "./app-container";

class TestMiddleware implements IMiddleware {
  use(request: Request, response: Response, next: (err?: unknown) => unknown) {
    console.log("Hello from middleware!");

    if (next) {
      next();
    }
  }
}

class TestControllerMiddleware implements IMiddleware {
  use(request: Request, response: Response, next: (err?: unknown) => unknown) {
    console.log("Hello from controller middleware!");

    if (next) {
      next();
    }
  }
}

interface TestModel {
  value1?: string;
  value2?: boolean;
}

@UseAfter(TestControllerMiddleware)
@Controller("/test")
export class TestController {
  @UseBefore(TestControllerMiddleware)
  @Post()
  testPost(@Body model: TestModel): TestModel {
    console.log("model: ", model);
    return model;
  }

  @Get()
  testGet() {
    console.log("test get");
    return "TEST GET";
  }

  @UseAfter(TestMiddleware)
  @UseBefore(TestMiddleware)
  @Get("/byId/:id")
  testGetWithParam(@Param("id") id: string) {
    console.log("controller method invoke!");
    console.log("id: ", id);
    return Promise.resolve(id);
  }
}

// @UseAfter(TestControllerMiddleware)
// @Controller("/test")
// export class TestController {
//   @Get()
//   testGet() {
//     console.log("test get");
//     return "test get";
//   }
// }

// Особливості побудови бібліотеки для розширення функціональності фреймворку express платформи node.js
// зробити план проєкту

// TODO: remove default usage of body parser as middleware
// TODO: add file receiving
// TODO: add decorators for types for swagger
// TODO: add validation decorators such as Min, Max, In, Required etc.
// TODO: add auth middleware
// TODO: di container

function main() {
  const config: ControllerBaseConfig = {
    cors: true,
    controllers: [TestController],
  };

  const appContainer = new AppContainer();
  appContainer.build(config);

  appContainer.listen(8000, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${8000}`);
  });
}

main();
