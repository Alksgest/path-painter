## Path Painter

A dynamic and intuitive library for Node.js, enabling developers to 'paint' their application's routes effortlessly.
Leveraging the power of decorators, it transforms controller definitions into beautifully crafted, easy-to-manage
routes (ChatGPT).
<br>Also, there is a support of simple dependency injection by marking classes with appropriate decorators.</br>

### Features:

- `@Controller` decorator which allows class to be registered as controller
- `@Middleware` decorator which allows class to be used as middleware
- `@Get`, `@Post`, `@Put`, `@Delete` decorators for controller methods. Decorating methods with these decorators
  automatically creates corresponding routs.
- `@UseBefore`, `@UseAfter` decorators for registering middlewares on method or class level.
- `@IsBoolean`, `@IsString`, `@IsNumber` decorators for validating input data
- `@Body`, `@Header`, `@Query`, `@Param` decorators for injecting corresponding data into the methods
- `@Injectable`, `@Singleton`, `@Transient` decorators for constructing classes via di container

### Controller example

Below can be found simple example of controller.
<br>Despite on name `MethodLevelMiddleware` can be applied on class level as well</br>

```ts
@UseBefore(ClassLevelMiddleware)
@Controller("/users")
export class UserController {
    @UseBefore(MethodLevelMiddleware)
    @Get("/:id")
    getUser(@Param("id") id: number): UserModel {
        console.log(`Getting user by ${id} id`);
        return {
            id,
            name: "Test Name",
            age: -1,
        };
    }

    @UseAfter(MethodLevelMiddleware)
    @Post()
    createUser(@Body dto: CreateUserDto) {
        console.log("Received dto: ", dto);
        return -1;
    }
}
```

### Middleware example

Below can be found simple example of middleware.

```ts
@Middleware()
export class ClassLevelMiddleware implements IMiddleware {
    use(
        request: Request,
        response: Response,
        next: (err?: unknown) => unknown,
    ): void {
        next();
    }
}
```

### Model validation example

Below can be found example of model with property validation decorators.

```ts
class CreateUserDto {
    @IsString()
    name?: string;
    @IsNumber({isOptional: true})
    age?: number;
}
```

### Startup example

Library provides class-container `AppContainer` for encapsulating logic of setting up and starting of an application.

Example of usage can be seen below.

```ts
function main() {
    const config: AppConfig = {
        cors: true,
        globalPrefix: "api",
        controllers: [UserController],
    };

    const appContainer = new AppContainer();
    appContainer.build(config);

    appContainer.start(8000, () => {
        console.log(`[server]: Server is running at http://localhost:${8000}`);
    });
}

main();
```

### Dependency injection example

```ts
@Injectable(InjectionType.Singleton)
class SomeRepository {
    public test() {
        console.log("repo");
    }
}

@Transient
class SomeService {
    constructor(private readonly repo: SomeRepository) {
    }

    public test() {
        console.log("service");
    }

    public testRepo() {
        this.repo.alive();
    }
}

@Middleware()
export class ClassLevelMiddleware implements IMiddleware {
    constructor(private readonly service: SomeService) {
    }

    use(
        request: Request,
        response: Response,
        next: (err?: unknown) => unknown,
    ): void {
        this.service.test();
        next();
    }
}
```