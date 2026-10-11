import { AccountEntity, SessionEntity, SystemConfigurationEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateSessionBodyDto } from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { SessionRestrictionEnum } from 'src/types/enums';

@Injectable()
export class ApiSessionsService {
  private readonly logger: Logger = new Logger(ApiSessionsService.name);

  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    private readonly authenticationService: AuthenticationService,
    @InjectModel(SessionEntity)
    private readonly sessionEntity: typeof SessionEntity,
    @InjectModel(SystemConfigurationEntity)
    private readonly systemConfigurationEntity: typeof SystemConfigurationEntity,
  ) {}

  /**
   * Creates a user session used for access APIs requiring authentication
   */
  async createSession(userAgent: string, body: CreateSessionBodyDto) {
    const jwtToken = await this.authenticationService.createSession(
      body.username,
      body.password,
      userAgent,
      SessionRestrictionEnum.WEB_UI,
      body.expiresDays,
    );
    return jwtToken;
  }

  async deleteSession(sessionId: number) {
    const session = await this.sessionEntity.findByPk(sessionId);
    if (!session) {
      throw new NotFoundException(ErrorCodes.SESSION_NOT_FOUND_ERROR);
    }
    if (session.endedAt || session.expiresAt?.getTime() < Date.now()) {
      throw new BadRequestException(ErrorCodes.INVALID_SESSION_ERROR);
    }
    await this.sessionEntity.update(
      {
        endedAt: new Date(),
      },
      {
        where: {
          id: session.id,
        },
      },
    );
  }

  async regenerateMasterSessionKey(accountId: number) {
    const currentConfiguration = await this.systemConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    await this.systemConfigurationEntity.create({
      indexerLogSize: currentConfiguration?.indexerLogSize ?? 100_000,
      sessionMasterKey: Guid.create(),
      createdByAccountId: accountId,
    } as SystemConfigurationEntity);
  }

  /**
   * Regenerates the session key for the specified user, invalidating all their current sessions.
   * @param adminAccountId The administrator performing the update
   * @param adminPassword The administrator's password to authorize the update
   * @param updateAccountId The target account to update
   */
  async regenerateUserSessionKey(adminAccountId: number, adminPassword: string, updateAccountId: number) {
    // verify administrator password
    const isAdminPasswordValid = await this.authenticationService.verifyPassword(adminAccountId, adminPassword);
    if (!isAdminPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_ADMIN_PASSWORD_ERROR);
    }
    // reset the account
    return this.regenerateSessionKey(updateAccountId);
  }

  /**
   * Regenerates the session key for a user, invalidating all their current sessions
   * @param userId The authenticated user ID
   * @throws If the specified account is not found
   */
  async regenerateSessionKey(userId: number) {
    const account = await this.accountEntity.findByPk(userId, { attributes: ['id'] });
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    await this.accountEntity.update(
      {
        sessionKey: Guid.create(),
      },
      { where: { id: userId } },
    );
  }
}
