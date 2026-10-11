import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { Guid } from 'typescript-guid';
import { SessionRestrictionEnum } from 'src/types/enums';

/**
 * The SessionEntity holds all of the information required to authenticate a JWT session token provided by frontend
 * clients.  Frontend clients are fed a Base64-encoded JWT JSON object that is signed by a secret on the server-side.
 *
 * The signature is created against a combination of tokens from:
 * - the platform-level so all sessions can be invalidated at once
 * - the account level so a user's sessions can be invalidated all at once by rotating these secrets
 * - the session-level so a specific session can be terminated
 * - the user's password hash so that changing the password invalidates all sessions for that user
 */
@Table({
  tableName: 'sessions',
  timestamps: true,
  underscored: true,
})
export class SessionEntity extends Model<SessionEntity> {
  /**
   * The account that owns the session
   */
  @BelongsTo(() => AccountEntity)
  account?: AccountEntity;

  /**
   * The account ID the session belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AccountEntity)
  declare accountId: number;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The date and time the session was manually ended
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare endedAt?: Date | null;

  /**
   * The date and time the session ends.  A session may end before this time by changing the
   * token, or the similar account-level token that can end all sessions belonging to an account,
   * or the platform-level token that does the same for all users.
   */
  @Column(DataType.DATE)
  declare expiresAt: Date;

  /**
   * The ID of the table row is an integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  /**
   * Whether the session is restricted to the APIs for a specific app, for instance if the signin
   * occurred in a Synology app then that session will not be allowed to access the web UI or APIs
   * for other apps.  This is a security measure to prevent a session from being used in an unintended
   * context.
   */
  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare restrictSession: SessionRestrictionEnum | null;

  /**
   * The session token is a random UUID used as part of a secret token that verifies session information.  A change in
   * this value invalidates a session immediately.
   */
  @Column({
    type: DataType.UUID,
    allowNull: false,
    set(value: Guid) {
      this.setDataValue('sessionToken', value.toString());
    },
  })
  declare sessionToken: Guid;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare updatedAt: Date | null;

  /**
   * The session user agent is the user agent string of the device that created the session, for loosely ensuring that
   * a session is only used by the device that created it.
   */
  @Column(DataType.STRING(255))
  declare userAgent: string;
}
