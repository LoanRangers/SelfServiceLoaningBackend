import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /tags:
 *   get:
 *     description: Retrieve all tags
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The unique ID of the tag.
 *                   name:
 *                     type: string
 *                     description: The name of the tag.
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tags.findMany();
    res.status(200).send(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).send({ error: 'Failed to fetch tags' });
  }
});

/**
 * @swagger
 * /tags:
 *   post:
 *     description: Create a new tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the tag.
 *     responses:
 *       200:
 *         description: Tag created successfully
 *       400:
 *         description: Invalid request body or duplicate tag
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const body = req.body;
  console.log(body);
  let response = await createTag(body, req.user);
  res.send(response);
});

async function createTag(tagData, userId) {
  let response;
  try {
    const { name } = tagData;

    if (!name || name.trim() === '') {
      throw new Error('Tag name is missing.');
    }

    const createdTag = await prisma.tags.create({
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Audit Log
    await prisma.auditLogs.create({
      data: {
        ssoId: userId,
        Action: 'CREATE',
        Table: 'Tags',
        Details: {
          tagId: createdTag.id,
          tagName: createdTag.name,
        },
      },
    });

    return createdTag;
  } catch (error) {
    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      return { error: 'A tag with this name already exists' };
    } else {
      console.error('Error in createTag:', error);
      return { error: 'Failed to create tag' };
    }
  }
}

export default router;