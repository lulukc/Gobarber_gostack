import * as Yup from 'yup';
import { parseISO, startOfHour, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointmen from '../models/Appointmen';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/notification';
import Queue from '../../lib/queue';
import CancellationMail from '../jobs/cancellationMail';

class AppointmenController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointmen = await Appointmen.findAll({
      where: {
        user_id: req.userID,
        canseled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'canselable'],
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

    // verificar se é provedor
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (provider_id === req.userID) {
      return res.status(401).json({ error: 'cannot request with yourself' });
    }

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

    // notificar o provedor
    const user = await User.findByPk(req.userID);
    const formattedDate = format(
      hourStar,
      "'dia' dd 'de' MMMM', às' HH:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointmen);
  }

  async delete(req, res) {
    const appointmen = await Appointmen.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointmen.user_id !== req.userID) {
      return res
        .status(401)
        .json({ error: 'You dont have permission to cancel this appointmen' });
    }
    const dateWithSub = subHours(appointmen.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cancel appointmen 2 hours in advance' });
    }

    appointmen.canseled_at = new Date();
    await appointmen.save();

    await Queue.add(CancellationMail.key, { appointmen });

    return res.json(appointmen);
  }
}

export default new AppointmenController();
