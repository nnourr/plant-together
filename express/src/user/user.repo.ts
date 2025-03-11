import sql from "../database/database.js";
import { logger } from "../logger.js";

export const registerUser = async (id: string, displayName: string, email: string) => {
  await sql`
      INSERT INTO "user" (id, display_name, email)
      VALUES (${id}, ${displayName}, ${email})
    `;

  logger.info(`Registered User ${id}.`, id);
};

export const getUsername = async (userId: string) => {
  if (!userId) {
    logger.error('User ID is undefined');
    return undefined;
  }

  const username = await sql`
      SELECT display_name
      FROM "user"
      WHERE id = ${userId}
    `;

  logger.info(`User name with ID ${userId}:`, userId);
  return username;
};