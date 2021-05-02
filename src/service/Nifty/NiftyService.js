import { RootRepository } from '../RootRepository';
import { NiftyOptionChainModel } from '../../db/models'

class NiftyService extends RootRepository {
  constructor(model) {
    super(model)
  }

  async find(condition) {
    const result = await super.find(condition);
    return result;
  }
  
  async create(item) {
    const result = await super.create(item);
    return result;
  }

  async findById(_id) {
    const result = await super.findById(_id);
    return result;
  }

}

export default new NiftyService(NiftyOptionChainModel);
