import { FormSchema } from "./types";
import { y96Schema } from "./y96";
import { transtornoMentalSchema } from "./transtornoMental";
import { materialBiologicoSchema } from "./materialBiologico";
import { lerDortSchema } from "./lerDort";
import { dermatoseSchema } from "./dermatose";
import { pairSchema } from "./pair";
import { pneumoconioseSchema } from "./pneumoconiose";
import { intoxicacaoExogenaSchema } from "./intoxicacaoExogena";
import { cancerSchema } from "./cancer";

export const FORM_SCHEMAS: Record<string, FormSchema> = {
  y96: y96Schema,
  "transtorno-mental": transtornoMentalSchema,
  "material-biologico": materialBiologicoSchema,
  "ler-dort": lerDortSchema,
  "dermatose-ocupacional": dermatoseSchema,
  pair: pairSchema,
  pneumoconiose: pneumoconioseSchema,
  cancer: cancerSchema,
  "intoxicacao-exogena": intoxicacaoExogenaSchema,
};

export function getFormSchema(slug: string): FormSchema | undefined {
  return FORM_SCHEMAS[slug];
}

/** Todos os 9 formulários usam o mesmo formulário de preenchimento genérico (DynamicForm). */
export const DYNAMIC_FORM_SLUGS = Object.keys(FORM_SCHEMAS);
