import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SessionEntity } from 'src/database/entities';

@Injectable()
export class UserEndSessionService {
  constructor(@InjectModel(SessionEntity) private readonly sessionEntity: typeof SessionEntity) {}

  async delete(session: SessionEntity): Promise<true> {
    const result = await this.sessionEntity.update(
      {
        endedAt: new Date(),
      },
      {
        where: {
          id: session.id,
        },
      },
    );
    if (result[0] > 0) {
      return true;
    }
    throw new InternalServerErrorException(ErrorCodes.INTERNAL_SERVER_ERROR);
  }
}
