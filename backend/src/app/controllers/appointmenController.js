import * as Yup from 'yup';
import { parseISO, startOfHour, isBefore } from 'date-fns';
import Appointmen from '../models/Appointmen';
import User from '../models/User';
import File from '../models/File';

class AppointmenController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointmen = await Appointmen.findAll({
      where: {
        user_id: req.userID,
        canseled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointmen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { provider_id, date } = req.body;
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    // verificar se é provedor

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }
    // verificar a hora
    const hourStar = startOfHour(parseISO(date));
    if (isBefore(hourStar, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }
    // verificar se esta disponivel
    const checkAvailability = await Appointmen.findOne({
      where: {
        provider_id,
        canseled_at: null,
        date: hourStar,
      },
    });
    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not availability' });
    }

    const appointmen = await Appointmen.create({
      user_id: req.userID,
      provider_id,
      date: hourStar,
    });
    return res.json(appointmen);
  }
}

export default new AppointmenController();
