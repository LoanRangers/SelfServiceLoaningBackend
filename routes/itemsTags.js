import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /itemsTags:
 *   get:
 *     description: Retrieve all tags associated with items
 *     responses:
 *       200:
 *         description: Tags on items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique ID of the item-tag association.
 *                   itemId:
 *                     type: string
 *                     description: The ID of the item.
 *                   tagId:
 *                     type: string
 *                     description: The ID of the tag.
 *                   tag:
 *                     type: object
 *                     description: The tag details.
 *                   item:
 *                     type: object
 *                     description: The item details.
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const itemsTags = await prisma.itemsTags.findMany({
      include: {
        tag: true, // Include tag details
        item: true, // Include item details
      },
    });
    res.status(200).send(itemsTags);
  } catch (error) {
    console.error('Error fetching tags on items:', error);
    res.status(500).send({ error: 'Failed to fetch tags on items' });
  }
});

/**
 * @swagger
 * /itemsTags:
 *   post:
 *     description: Add a tag to an item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagName
 *               - itemId
 *             properties:
 *               tagName:
 *                 type: string
 *                 description: The name of the tag to associate with the item.
 *               itemId:
 *                 type: string
 *                 description: The ID of the item to tag.
 *     responses:
 *       200:
 *         description: Tag added to item successfully
 *       400:
 *         description: Invalid request body or duplicate tag
 *       404:
 *         description: Tag or item not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const { tagName, itemId } = req.body;

  if (!tagName || !itemId) {
    return res.status(400).send({ error: 'tagName and itemId are required' });
  }

  try {
    // Check if the tag exists, otherwise create it
    const tag = await prisma.tags.upsert({
      where: { name: tagName.trim() },
      update: {},
      create: { name: tagName.trim() },
    });

    // Check if the item exists
    const item = await prisma.items.findUnique({
      where: { id: itemId.trim() },
    });
    if (!item) {
      return res.status(404).send({ error: 'Item not found' });
    }

    // Check if the tag is already associated with the item
    const existingItemTag = await prisma.itemsTags.findFirst({
      where: { tagId: tag.id, itemId: itemId.trim() },
    });
    if (existingItemTag) {
      return res.status(400).send({ error: 'This tag is already associated with the item' });
    }

    // Add the tag to the item
    const itemTag = await prisma.itemsTags.create({
      data: {
        tagId: tag.id,
        itemId: itemId.trim(),
      },
      select: {
        id: true,
        itemId: true,
        tagId: true,
      },
    });

    res.status(200).send(itemTag);
  } catch (error) {
    console.error('Error adding tag to item:', error);
    res.status(500).send({ error: 'Failed to add tag to item' });
  }
});

export default router;