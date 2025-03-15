import sql from "../database/database.js";
import { logger } from "../logger.js";

export const registerUser = async (id: string, displayName: string, email: string) => {
  await sql`
      INSERT INTO "user" (id, display_name, email)
      VALUES (${id}, ${displayName}, ${email})
    `;

  logger.info(`Registered User ${id}.`);
};

export const retrieveDisplayName = async (userId: string) : Promise<string> => {
  if (!userId) {
    const message = 'User ID is undefined';

    logger.error(message);
    throw new Error(message);
  }

  logger.info(`Retrieving display name with ID ${userId}...`);

  const records = await sql`
      SELECT display_name
      FROM "user"
      WHERE id = ${userId}
    `;
  
  if (!records || records.length === 0) {
    const message = `Display name with ID ${userId} not found.`;

    logger.error(message);
    throw new Error(message);
  };

  const displayName = records.at(0)?.display_name || '' as string;

  logger.info(`Display name with ID ${userId}: ${displayName}`);
  return displayName;
};
