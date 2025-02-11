import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cors from "@fastify/cors";
import { Static, Type } from "@sinclair/typebox";
import { v4 as uuidv4 } from "uuid";

type Superhero = Static<typeof SuperheroSchema>;

type CreateSuperhero = Static<typeof CreateSuperheroSchema>;

const SuperheroSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
  avatar: Type.String(),
});

const CreateSuperheroSchema = Type.Object({
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
});

const app: FastifyInstance = Fastify().withTypeProvider();

await app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
});

let superheroes: Superhero[] = [
  {
    id: uuidv4(),
    name: "Captain Humility",
    superpower: "Self-awareness",
    humilityScore: 10,
    avatar: `https://api.dicebear.com/9.x/notionists/svg?scale=100&seed=CaptainHumility`,
  },
  {
    id: uuidv4(),
    name: "Modesty Woman",
    superpower: "Power Reflection",
    humilityScore: 9,
    avatar: `https://api.dicebear.com/9.x/notionists/svg?scale=100&seed=ModestyWoman`,
  },
  {
    id: uuidv4(),
    name: "Honest Arrow",
    superpower: "Truth Perception",
    humilityScore: 8,
    avatar: `https://api.dicebear.com/9.x/notionists/svg?scale=100&seed=HonestArrow`,
  },
];

app.post<{ Body: CreateSuperhero }>(
  "/superheroes",
  {
    schema: {
      body: CreateSuperheroSchema,
      response: {
        201: SuperheroSchema,
      },
    },
  },
  async (
    request: FastifyRequest<{ Body: CreateSuperhero }>,
    reply: FastifyReply
  ) => {
    const id = uuidv4();
    const superhero: Superhero = {
      id,
      ...request.body,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?scale=100&seed=${encodeURIComponent(
        request.body.name
      )}`,
    };
    superheroes.push(superhero);
    reply.code(201);
    return superhero;
  }
);

app.get(
  "/superheroes",
  {
    schema: {
      response: {
        200: Type.Array(SuperheroSchema),
      },
    },
  },
  async (): Promise<Superhero[]> => {
    return superheroes.sort((a, b) => b.humilityScore - a.humilityScore);
  }
);

app.delete<{ Params: { id: string } }>(
  "/superheroes/:id",
  {
    schema: {
      params: Type.Object({ id: Type.String() }),
      response: {
        200: Type.Object({
          message: Type.String(),
          deletedHero: SuperheroSchema,
        }),
        404: Type.Object({ message: Type.String() }),
      },
    },
  },
  async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const heroIndex = superheroes.findIndex((hero) => hero.id === id);

    if (heroIndex === -1) {
      reply.code(404);
      return { message: "Superhero not found" };
    }

    const deletedHero = superheroes[heroIndex];
    superheroes = superheroes.filter((hero) => hero.id !== id);

    return {
      message: "Superhero successfully deleted",
      deletedHero,
    };
  }
);

const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3002,
      host: "0.0.0.0",
    });
    console.log("Server running on port 3002");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
