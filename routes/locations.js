import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /locations:
 *   get:
 *     description: Returns all locations
 *     responses:
 *       200:
 *         description: All locations returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  const locations = await prisma.locations.findMany();
  res.send(locations);
});

router.post('/', jsonParser, async (req, res) => {
  const body = req.body;
  const location = await prisma.locations.create({
    data: {
      name: body.name,
    },
    select: {
      id: true,
      name: true,
    },
  });
  res.send(location);
});

export default router;
