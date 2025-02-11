import { Type, Static } from "@sinclair/typebox";

export const SuperheroSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
  avatar: Type.String(),
});

export const CreateSuperheroSchema = Type.Object({
  name: Type.String(),
  superpower: Type.String(),
  humilityScore: Type.Number({ minimum: 1, maximum: 10 }),
});
