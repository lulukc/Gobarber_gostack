import Appointmen from '../models/Appointmen';
import User from '../models/User';
import File from '../models/File';

class ScheduleController {
  async index(req, res) {
    return res.json({ ok: true });
  }
}

export default new ScheduleController();
