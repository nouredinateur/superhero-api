import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cors from "@fastify/cors";
import { Static, Type } from "@sinclair/typebox";
import { SuperheroService } from './database/superheroService.js';
import { initializeDatabase } from './database/init.js';
import dotenv from 'dotenv';

dotenv.config();

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

const UpdateSuperheroSchema = Type.Object({
  name: Type.Optional(Type.String()),
  superpower: Type.Optional(Type.String()),
  humilityScore: Type.Optional(Type.Number({ minimum: 1, maximum: 10 })),
});

const app: FastifyInstance = Fastify().withTypeProvider();

await app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

// Create superhero
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
    try {
      const superhero = await SuperheroService.createSuperhero(request.body);
      reply.code(201);
      return superhero;
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to create superhero' };
    }
  }
);

// Get all superheroes
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
    try {
      return await SuperheroService.getAllSuperheroes();
    } catch (error) {
      throw new Error('Failed to fetch superheroes');
    }
  }
);

// Get superhero by ID
app.get<{ Params: { id: string } }>(
  "/superheroes/:id",
  {
    schema: {
      params: Type.Object({ id: Type.String() }),
      response: {
        200: SuperheroSchema,
        404: Type.Object({ message: Type.String() }),
      },
    },
  },
  async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const superhero = await SuperheroService.getSuperheroById(request.params.id);
      
      if (!superhero) {
        reply.code(404);
        return { message: "Superhero not found" };
      }
      
      return superhero;
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to fetch superhero' };
    }
  }
);

// Update superhero
app.put<{ Params: { id: string }; Body: Partial<CreateSuperhero> }>(
  "/superheroes/:id",
  {
    schema: {
      params: Type.Object({ id: Type.String() }),
      body: UpdateSuperheroSchema,
      response: {
        200: SuperheroSchema,
        404: Type.Object({ message: Type.String() }),
      },
    },
  },
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateSuperhero> }>,
    reply: FastifyReply
  ) => {
    try {
      const updatedSuperhero = await SuperheroService.updateSuperhero(
        request.params.id,
        request.body
      );
      
      if (!updatedSuperhero) {
        reply.code(404);
        return { message: "Superhero not found" };
      }
      
      return updatedSuperhero;
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to update superhero' };
    }
  }
);

// Delete superhero
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
    try {
      const deletedHero = await SuperheroService.deleteSuperhero(request.params.id);
      
      if (!deletedHero) {
        reply.code(404);
        return { message: "Superhero not found" };
      }
      
      return {
        message: "Superhero successfully deleted",
        deletedHero,
      };
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to delete superhero' };
    }
  }
);

const start = async () => {
  try {
    // Initialize database and seed initial data
    await initializeDatabase();
    await SuperheroService.seedInitialData();
    
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
