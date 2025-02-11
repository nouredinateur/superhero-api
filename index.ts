import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Static, Type } from "@sinclair/typebox";

// Superhero Schema
const SuperheroSchema = Type.Object({
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
});

type Superhero = Static<typeof SuperheroSchema>;

const app = fastify().withTypeProvider<TypeBoxTypeProvider>();
let superheroes: Superhero[] = [];

// POST endpoint
app.post(
  "/superheroes",
  {
    schema: {
      body: SuperheroSchema,
      response: {
        201: SuperheroSchema,
      },
    },
  },
  async (request, reply) => {
    superheroes.push(request.body);
    reply.code(201);
    return request.body;
  }
);

// GET endpoint
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

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server running on port 3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
