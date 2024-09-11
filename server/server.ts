import express,{Request, Response} from "express"
import { PersonaRouter } from "./routes/PersonaRoute";
import {PostsRouter} from "./routes/PostsRoute";
import { LinkedinCallbackRouter} from "./linkedin/LinkedInCallback";
import { authRouter, authenticateUserMiddleware } from "./firebase/auth";
import {FormAIContentRouter} from "./routes/FormAIContentRouter";
import {EngagementRouter} from "./routes/EngagementRouter";
import {TasksRouter} from "./routes/TasksRoute";
import {pool} from "./db/psql";

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

app.get('/get-persona-and-posts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {

    console.log('I am here')
    // Step 1: Get persona_id from personas table
    const personaResult = await pool.query(`
      SELECT id FROM persona_input 
      WHERE user_id = $1 
      ORDER BY created_at DESC LIMIT 1;
    `, [userId]);


    if (personaResult.rows.length === 0) {
      return res.status(404).json({ message: 'No persona found' });
    }

    const personaId = personaResult.rows[0].id;

    console.log(personaId)

    // Step 2: Get posts associated with the persona_id from posts table
    const postsResult = await pool.query(`
      SELECT 
        post_content AS "Post_content",
        post_date AS "Post_date"
      FROM posts 
      WHERE persona_id = $1;
    `, [personaId]);

    console.log(postsResult.rows)

    res.json({
      personaId,
      generatedPosts: postsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching persona and posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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


