import mongoose from 'mongoose';
import moment from 'moment';
import { NiftyService } from "../../service/Nifty";

class NiftyController {

  async find(req, res) {
    try {
      const data = await NiftyService.find()
      return res.status(200).json({ message: "Data fetch successfully", data })
    } catch (error) {
      return res.status(500).json({ "error": error })
    }
  }
  
  async findById(req, res) {
    const { id } = req.params;
    try {
      const data = await NiftyService.findById(id)
      return res.status(200).json({ message: "Data fetch successfully", data })
    } catch (error) {
      return res.status(500).json({ "error": error })
    }
  }

  async create(req, res) {
    const { name } = req.body;
    const newObject = {
      name,
    };
    
    try {
      const data = await NiftyService.create(newObject)
      return res.status(201).json({ message: "New record created", data });

    } catch (error) {
      return res.status(500).json({ "error": error })
    }
  }
}

export default new NiftyController();