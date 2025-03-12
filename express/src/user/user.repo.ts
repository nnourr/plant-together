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
    logger.error('User ID is undefined');
    return undefined;
  }

  logger.info(`Retrieving display name with ID ${userId}...`);

  const records = await sql`
      SELECT display_name
      FROM "user"
      WHERE id = ${userId}
    `;
  
  if (!records || records.length === 0) {
    logger.error(`Display name with ID ${userId} not found.`);
    return '';
  };

  const displayName = records.at(0)?.display_name || '' as string;

  logger.info(`Display name with ID ${userId}: ${displayName}`);
  return displayName;
};
