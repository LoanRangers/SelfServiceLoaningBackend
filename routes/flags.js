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
 *         description: Invalid request body or duplicate flag
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateJWT, async (req, res) => {
  const body = req.body;
  console.log(body);
  let response = await createFlag(body, req.user);
  res.send(response);
});

async function createFlag(flagData, ssoId) {
  const { name, description } = flagData;

  if (!name || name.trim() === '') {
    throw { status: 400, message: 'Flag name is missing.' };
  }

  if (!description || description.trim() === '') {
    throw { status: 400, message: 'Flag description is missing.' };
  }

  const existingFlag = await prisma.flags.findUnique({ where: { name: name.trim() } });
  if (existingFlag) {
    throw { status: 400, message: 'A flag with this name already exists.' };
  }

  const createdFlag = await prisma.flags.create({
    data: {
      name: name.trim(),
      description: description.trim(),
    },
    select: {
      name: true,
      description: true,
    },
  });

  return createdFlag;
}

export default router;
