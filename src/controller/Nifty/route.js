import express from 'express';

import NiftyController from './controller';

const router = express.Router()

// health check
router.get('/health', (req, res) => res.send({message: "Nifty API Working"}))

// findById
router.get('/:id', NiftyController.findById)

// insert new data
router.post('/create', NiftyController.create)

// get all data
router.get('/', NiftyController.find)


export default router;
