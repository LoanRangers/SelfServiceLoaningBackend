import prisma from '../services/dbservice.js';
import express from 'express';
import authenticateJWT from '../middleware/auth.js';
const router = express.Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     description: Returns all comments
 *     responses:
 *       200:
 *         description: All comments returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const comments = await prisma.comments.findMany({
      include: { item: true },
    });
    res.status(200).send(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).send({ error: 'Failed to fetch comments' });
  }
});

/**
 * @swagger
 * /comments:
 *   post:
 *     description: Create a new comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - itemId
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the comment.
 *               itemId:
 *                 type: string
 *                 description: The ID of the item the comment is attached to.
 *     responses:
 *       200:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const body = req.body;
  console.log(body);
  let response = await createComment(body, req.user);
  res.send(response);
});

async function createComment(comment, ssoId) {
  try {
    const { content, itemId } = comment;

    if (!content || content.trim() === '') {
      throw new Error('Comment content is missing.');
    }
    if (!itemId || itemId.trim() === '') {
      throw new Error('Item ID is missing.');
    }

    const existingItem = await prisma.items.findUnique({ where: { id: itemId } });
    if (!existingItem) {
      throw new Error('The specified item does not exist.');
    }

    const createdComment = await prisma.comments.create({
      data: {
        content: content.trim(),
        itemId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    // Audit Log
    await prisma.auditLogs.create({
      data: {
        ssoId,
        Action: 'COMMENT',
        Table: 'Items',
        Details: {
          commentId: createdComment.id,
          content: createdComment.content,
          itemId: itemId,
        },
      },
    });

    return createdComment;
  } catch (e) {
    console.error('Error in createComment:', e);
    return { error: e.message };
  }
}

export default router;
