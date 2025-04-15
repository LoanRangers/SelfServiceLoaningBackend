import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /qrcodes:
 *   get:
 *     description: Returns all QR codes
 *     responses:
 *       200:
 *         description: All QR codes returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const qrCodes = await prisma.qRCodes.findMany();
    res.status(200).send(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).send({ error: 'Failed to fetch QR codes' });
  }
});

/**
 * @swagger
 * /qrcodes:
 *   post:
 *     description: Create new QR codes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - guid
 *                 - name
 *               properties:
 *                 guid:
 *                   type: string
 *                   description: The unique GUID for the QR code.
 *                 name:
 *                   type: string
 *                   description: The name of the QR code.
 *     responses:
 *       200:
 *         description: QR codes created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  const qrCodes = req.body;

  if (!Array.isArray(qrCodes) || qrCodes.some(qr => !qr.guid || !qr.name)) {
    return res.status(400).send({ error: 'Invalid request body. Each QR code must have a guid and name.' });
  }

  try {
    const createdQRCodes = await prisma.qRCodes.createMany({
      data: qrCodes.map(qr => ({
        guid: qr.guid,
        name: qr.name,
      })),
      skipDuplicates: true, // Avoid duplicate GUIDs
    });

    res.status(200).send({ message: 'QR codes created successfully', count: createdQRCodes.count });
  } catch (error) {
    console.error('Error creating QR codes:', error);
    res.status(500).send({ error: 'Failed to create QR codes' });
  }
});

export default router;