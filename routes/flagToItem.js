import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /flags/items:
 *   get:
 *     description: Retrieve all flags associated with items
 *     responses:
 *       200:
 *         description: Flags on items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   flagId:
 *                     type: string
 *                     description: The unique ID of the flag on the item.
 *                   itemId:
 *                     type: string
 *                     description: The ID of the item.
 *                   flagName:
 *                     type: string
 *                     description: The name of the flag.
 *                   flag:
 *                     type: object
 *                     description: The flag details.
 *                   item:
 *                     type: object
 *                     description: The item details.
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const flagsOnItems = await prisma.flagsOnItems.findMany({
      include: {
        flag: true, // Include flag details
        item: true, // Include item details
      },
    });
    res.status(200).send(flagsOnItems);
  } catch (error) {
    console.error('Error fetching flags on items:', error);
    res.status(500).send({ error: 'Failed to fetch flags on items' });
  }
});

/**
 * @swagger
 * /flags/items:
 *   post:
 *     description: Add a flag to an item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flagName
 *               - itemId
 *             properties:
 *               flagName:
 *                 type: string
 *                 description: The name of the flag to associate with the item.
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to flag.
 *     responses:
 *       200:
 *         description: Flag added to item successfully
 *       400:
 *         description: Invalid request body or duplicate flag
 *       404:
 *         description: Flag or item not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const body = req.body;
  console.log(body);
  let response = await processFlag(body, req.user);
  res.send(response);
});

async function processFlag(flagData, userId) {
  let response;
  try {
    const { flagName, itemId } = flagData;

    // Validate inputs
    if (!flagName || typeof flagName !== 'string' || flagName.trim() === '') {
      throw new Error('Flag name is required and must be a non-empty string.');
    }
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      throw new Error('Item ID is required and must be a non-empty string.');
    }

    // Check if the flag exists
    const flag = await prisma.flags.findUnique({
      where: { name: flagName.trim() },
    });
    if (!flag) {
      throw new Error('Flag not found.');
    }

    // Check if the item exists
    const item = await prisma.items.findUnique({
      where: { id: itemId.trim() },
    });
    if (!item) {
      throw new Error('Item not found.');
    }

    // Check if the flag is already associated with the item
    const existingFlagOnItem = await prisma.flagsOnItems.findFirst({
      where: { flagName: flagName.trim(), itemId: itemId.trim() },
    });

    if (existingFlagOnItem) {
      // If the flag is already associated, delete it
      await prisma.flagsOnItems.delete({
        where: { flagId: existingFlagOnItem.flagId },
      });

      // Audit Log for flag removal
      await prisma.auditLogs.create({
        data: {
          ssoId: userId,
          Action: 'UNFLAG',
          Table: 'FlagsOnItems',
          Details: {
            flagName: existingFlagOnItem.flagName,
            itemId: existingFlagOnItem.itemId,
          },
        },
      });

      response = { message: 'Flag removed from the item successfully.' };
    } else {
      // Add the flag to the item
      const flagOnItem = await prisma.flagsOnItems.create({
        data: {
          flagName: flagName.trim(),
          itemId: itemId.trim(),
        },
        select: {
          flagName: true,
          itemId: true,
        },
      });

      // Audit Log for flag addition
      await prisma.auditLogs.create({
        data: {
          ssoId: userId,
          Action: 'FLAG',
          Table: 'FlagsOnItems',
          Details: {
            flagName: flagOnItem.flagName,
            itemId: flagOnItem.itemId,
          },
        },
      });

      response = flagOnItem;
    }
  } catch (error) {
    console.error('Error in processFlag:', error);
    response = { error: error.message };
  }
  return response;
}

export default router;