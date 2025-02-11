import { test, expect, describe, beforeAll, afterAll } from "@jest/globals";
import supertest from "supertest";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { Type } from "@sinclair/typebox";
import { v4 as uuidv4 } from "uuid";

describe("Superhero API Tests", () => {
  let app;
  let server;

  beforeAll(async () => {
    // Create Fastify instance
    app = Fastify().withTypeProvider();

    // Register CORS
    await app.register(cors, {
      origin: "*",
      methods: ["GET", "POST", "DELETE"],
    });

    // Define schemas
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

    // Initialize test data
    let superheroes = [
      {
        id: uuidv4(),
        name: "Captain Humility",
        superpower: "Self-awareness",
        humilityScore: 10,
        avatar: `https://api.dicebear.com/9.x/notionists/svg?scale=100&seed=CaptainHumility`,
      },
    ];

    // Register routes
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
        const id = uuidv4();
        const superhero = {
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

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /superheroes", () => {
    test("should return list of superheroes sorted by humility score", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/superheroes",
      });

      expect(response.statusCode).toBe(200);
      const heroes = JSON.parse(response.payload);

      expect(Array.isArray(heroes)).toBe(true);

      // Check if heroes are sorted by humility score
      for (let i = 0; i < heroes.length - 1; i++) {
        expect(heroes[i].humilityScore >= heroes[i + 1].humilityScore).toBe(
          true
        );
      }

      // Verify schema compliance
      heroes.forEach((hero) => {
        expect(hero).toHaveProperty("id");
        expect(hero).toHaveProperty("name");
        expect(hero).toHaveProperty("superpower");
        expect(hero).toHaveProperty("humilityScore");
        expect(hero).toHaveProperty("avatar");
        expect(typeof hero.humilityScore).toBe("number");
        expect(hero.humilityScore).toBeGreaterThanOrEqual(1);
        expect(hero.humilityScore).toBeLessThanOrEqual(10);
      });
    });
  });

  describe("POST /superheroes", () => {
    test("should create a new superhero", async () => {
      const newHero = {
        name: "Test Hero",
        superpower: "Testing",
        humilityScore: 7,
      };

      const response = await app.inject({
        method: "POST",
        url: "/superheroes",
        payload: newHero,
      });

      expect(response.statusCode).toBe(201);
      const createdHero = JSON.parse(response.payload);

      expect(createdHero.name).toBe(newHero.name);
      expect(createdHero.superpower).toBe(newHero.superpower);
      expect(createdHero.humilityScore).toBe(newHero.humilityScore);
      expect(createdHero.avatar).toContain(encodeURIComponent(newHero.name));
    });

    test("should reject invalid humility score", async () => {
      const invalidHero = {
        name: "Invalid Hero",
        superpower: "Testing",
        humilityScore: 11,
      };

      const response = await app.inject({
        method: "POST",
        url: "/superheroes",
        payload: invalidHero,
      });

      expect(response.statusCode).toBe(400);
    });

    test("should reject missing required fields", async () => {
      const incompleteHero = {
        name: "Incomplete Hero",
      };

      const response = await app.inject({
        method: "POST",
        url: "/superheroes",
        payload: incompleteHero,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /superheroes/:id", () => {
    test("should delete an existing superhero", async () => {
      // First create a hero to delete
      const newHero = {
        name: "Hero to Delete",
        superpower: "Deletion",
        humilityScore: 5,
      };

      const createResponse = await app.inject({
        method: "POST",
        url: "/superheroes",
        payload: newHero,
      });

      const createdHero = JSON.parse(createResponse.payload);

      // Now delete the hero
      const deleteResponse = await app.inject({
        method: "DELETE",
        url: `/superheroes/${createdHero.id}`,
      });

      expect(deleteResponse.statusCode).toBe(200);
      const result = JSON.parse(deleteResponse.payload);
      expect(result.message).toBe("Superhero successfully deleted");
      expect(result.deletedHero.id).toBe(createdHero.id);

      // Verify hero is actually deleted
      const getResponse = await app.inject({
        method: "GET",
        url: "/superheroes",
      });

      const remainingHeroes = JSON.parse(getResponse.payload);
      expect(
        remainingHeroes.find((hero) => hero.id === createdHero.id)
      ).toBeUndefined();
    });

    test("should return 404 for non-existent superhero", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/superheroes/non-existent-id",
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result.message).toBe("Superhero not found");
    });
  });
});
