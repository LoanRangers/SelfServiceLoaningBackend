import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /categories:
 *   get:
 *     description: Returns all categories
 *     responses:
 *       200:
 *         description: All categories returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.categories.findMany();
    res.status(200).send(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send({ error: 'Failed to fetch categories' });
  }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     description: Creates a new category
 *     parameters:
 *       - in: body
 *         name: category
 *         description: The name of the category to create.
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: Category created successfully
 *       400:
 *         description: Category name is required
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  let name;

  // Check if the request body is JSON or plain text
  if (typeof req.body === 'string') {
    name = req.body; // Plain text input
  } else if (req.body && req.body.name) {
    name = req.body.name; // JSON input
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).send({ error: 'Category name is required and must be a string' });
  }

  try {
    const category = await prisma.categories.create({
      data: { name }, // Use the category name to create a new category
    });
    res.status(200).send(category); // Respond with the created category
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).send({ error: 'Failed to create category' });
  }
});

export default router;