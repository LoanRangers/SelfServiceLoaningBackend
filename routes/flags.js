import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

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

router.post('/', jsonParser, async (req, res) => {
  const flag = await prisma.flags.create({
    data: {},
    select: {
      id: true,
    },
  });
  res.send(flag);
});

export default router;
