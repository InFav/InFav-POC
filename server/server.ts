import express,{Request, Response} from "express"
import { PersonaRouter } from "./routes/PersonaRoute";
import {PostsRouter} from "./routes/PostsRoute";
import { LinkedinCallbackRouter} from "./linkedin/LinkedInCallback";
import { authRouter, authenticateUserMiddleware } from "./firebase/auth";
import {FormAIContentRouter} from "./routes/FormAIContentRouter";
import {EngagementRouter} from "./routes/EngagementRouter";
import {TasksRouter} from "./routes/TasksRoute";

const allowedOrigins = ['http://localhost:5173', 'https://infav-hackday-4.web.app'];

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

const app = express();
const port = process.env.PORT || 8080;
const cors = require('cors');

app.use(express.json());
app.use(cors(corsOptions));  // This will allow requests from any origin

app.use("/auth", authRouter)

app.use("/linkedin", LinkedinCallbackRouter)

app.use(authenticateUserMiddleware)

app.use("/persona", PersonaRouter)
app.use("/posts", PostsRouter)
app.use("/persona", PersonaRouter)
app.use("/engagements", EngagementRouter)
app.use("/form-ai", FormAIContentRouter)
app.use("/task", TasksRouter);



app.get("/health", (req: Request, res:Response) => {
  res.sendStatus(200)
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


