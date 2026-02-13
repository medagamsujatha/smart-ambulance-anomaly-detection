
import { z } from 'zod';
import { insertPatientSchema, insertVitalSchema, insertAlertSchema, patients, vitals, alerts } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  patients: {
    list: {
      method: 'GET' as const,
      path: '/api/patients' as const,
      responses: {
        200: z.array(z.custom<typeof patients.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/patients/:id' as const,
      responses: {
        200: z.custom<typeof patients.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/patients' as const,
      input: insertPatientSchema,
      responses: {
        201: z.custom<typeof patients.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  vitals: {
    list: {
      method: 'GET' as const,
      path: '/api/patients/:patientId/vitals' as const,
      input: z.object({
        limit: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof vitals.$inferSelect>()),
      },
    },
    stats: {
        method: 'GET' as const,
        path: '/api/patients/:patientId/stats' as const,
        responses: {
            200: z.object({
                riskScore: z.number(),
                riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
                factors: z.array(z.string())
            })
        }
    }
  },
  alerts: {
    list: {
      method: 'GET' as const,
      path: '/api/patients/:patientId/alerts' as const,
      responses: {
        200: z.array(z.custom<typeof alerts.$inferSelect>()),
      },
    },
    acknowledge: {
      method: 'PATCH' as const,
      path: '/api/alerts/:id/acknowledge' as const,
      responses: {
        200: z.custom<typeof alerts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  simulation: {
    toggle: {
      method: 'POST' as const,
      path: '/api/simulation/toggle' as const,
      input: z.object({
        patientId: z.number(),
        scenario: z.enum(["NORMAL", "DISTRESS", "ARTIFACT_NOISE", "CONNECTION_LOSS"]),
        running: z.boolean()
      }),
      responses: {
        200: z.object({ message: z.string(), state: z.any() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
