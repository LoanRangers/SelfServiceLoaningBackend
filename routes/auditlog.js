import prisma from '../services/dbservice.js';
import express from 'express';
const jsonParser = express.json();
const router = express.Router();
router.use(jsonParser);

/**
 * @swagger
 * /auditlog:
 *   get:
 *     description: Returns all audit logs
 *     responses:
 *       200:
 *         description: All audit logs returned successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const auditLogs = await prisma.auditLogs.findMany();
    res.send(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).send({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * @swagger
 * /auditLog:
 *   post:
 *     description: Creates a new audit log entry
 *     responses:
 *       200:
 *         description: Audit log created successfully
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  const body = req.body;
  try {
    const auditLogs = await prisma.auditLog.create({
      data: body,
    });
    res.send(auditLogs);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).send({ error: 'Failed to create audit log' });
  }
});

export default router;
