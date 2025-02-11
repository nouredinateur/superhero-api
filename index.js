import Fastify from "fastify";
import cors from "@fastify/cors";
import { Type } from "@sinclair/typebox";
import { v4 as uuidv4 } from "uuid";

const SuperheroSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
  avatar: Type.String(),
});

const app = Fastify().withTypeProvider();

await app.register(cors, {
  origin: "*", // Allow all origins (for development)
  methods: ["GET", "POST", "DELETE"],
});

let superheroes = [
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

const CreateSuperheroSchema = Type.Object({
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
});

app.post(
  "/superheroes",
  {
    schema: {
      body: CreateSuperheroSchema,
      response: {
        201: SuperheroSchema,
      },
    },
  },
  async (request, reply) => {
    const id = uuidv4(); // Generate a unique ID for the new superhero
    const superhero = {
      id: id,
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
  async () => {
    return superheroes.sort((a, b) => b.humilityScore - a.humilityScore);
  }
);

app.delete(
  "/superheroes/:id",
  {
    schema: {
      params: Type.Object({
        id: Type.String(),
      }),
      response: {
        200: Type.Object({
          message: Type.String(),
          deletedHero: SuperheroSchema,
        }),
        404: Type.Object({
          message: Type.String(),
        }),
      },
    },
  },
  async (request, reply) => {
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
    await app.listen({ port: process.env.PORT || 3001, host: "0.0.0.0" });
    console.log("Server running on port 3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
