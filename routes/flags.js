import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /flags:
 *   get:
 *     description: Returns all flags
 *     responses:
 *       200:
 *         description: All flags returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const flags = await prisma.flags.findMany();
    res.status(200).send(flags);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).send({ error: 'Failed to fetch flags' });
  }
});

/**
 * @swagger
 * /flags:
 *   post:
 *     description: Create a new flag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the flag.
 *               description:
 *                 type: string
 *                 description: The description of the flag.
 *     responses:
 *       200:
 *         description: Flag created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send({ error: 'Name and description are required' });
  }

  try {
    const flag = await prisma.flags.create({
      data: {
        name: name.trim(),
        description: description.trim(),
      },
      select: {
        name: true,
        description: true,
      },
    });
    res.status(200).send(flag);
  } catch (error) {
    console.error('Error creating flag:', error);
    res.status(500).send({ error: 'Failed to create flag' });
  }
});

/**
 * @swagger
 * /flags:
 *   post:
 *     description: Create a new flag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the flag.
 *     responses:
 *       200:
 *         description: Flag created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/flags', authenticateJWT, async (req, res) => {
  const { itemId, flagName, comment } = req.body;

  if (!itemId || !flagName || !comment) {
    return res.status(400).send({ error: 'Item ID, flag name, and comment are required.' });
  }

  try {
    // Check if the item exists
    const item = await prisma.items.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).send({ error: 'Item not found.' });
    }

    // Create the flag on the item
    const flagOnItem = await prisma.flagsOnItems.create({
      data: {
        itemId,
        flagName,
      },
    });

    // Add the comment associated with the flagged item
    const commentEntry = await prisma.comments.create({
      data: {
        content: comment,
        itemId,
      },
    });

    res.status(200).send({ flagOnItem, commentEntry });
  } catch (error) {
    console.error('Error flagging item:', error);
    res.status(500).send({ error: 'Failed to flag the item.' });
  }
});

export default router;