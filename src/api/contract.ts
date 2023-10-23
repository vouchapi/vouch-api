// contract.ts

import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string()
});

export const version1 = c.router({
  registerProfile: {
    method: 'POST',
    path: 'profiles/:id/register',
    body: z.object({
      id: z.string(),
      username: z.string()
    }),
    responses: {
      200: PostSchema
    }
  }
});
