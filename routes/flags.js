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
  const flags = await prisma.flags.findMany();
  res.send(flags);
});

router.post('/', authenticateJWT, async (req, res) => {
  const flag = await prisma.flags.create({
    data: {},
    select: {
      id: true,
    },
  });
  res.send(flag);
});

export default router;
