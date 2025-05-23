import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /users:
 *   get:
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: All users returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  const user = await prisma.users.findMany();
  res.send(user);
});

router.post('/', jsonParser, async (req, res) => {
  const user = await prisma.users.create({
    data: {},
    select: {
      id: true,
    },
  });
  res.send(user);
});

export default router;
