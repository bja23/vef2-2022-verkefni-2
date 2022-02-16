import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import {
  createSchema,
  dropSchema,
  end,
  createEvent,
} from '../lib/db';

/**
 * Hér er test gagnagrunnur búinn til og hent áður en test eru keyrð.
 * package.json sér um að nota dotenv-cli til að loada .env.test sem vísar í þann gagnagrunn
 * sem ætti *ekki* að vera sá sami og við notum „almennt“
 */

describe('db', () => {
  beforeAll(async () => {
    await dropSchema();
    await createSchema();
  });

  afterAll(async () => {
    await end();
  });

  it('empty string should return null', async () => {
    const result = await createEvent('','');
    expect(result).toBe(null);
  });

  it('should be exepted and return true', async () => {
    const result = await createEvent('Hugbúnaðarverkefni 1','');
    expect(result).toBe(true);
  });
});
