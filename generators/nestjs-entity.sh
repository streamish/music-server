#!/bin/bash
# eg: ./nestjs-entity.sh EntityName table-name
ENTITY_CLASS=$1
TABLE_NAME=$2
OVERWRITE=$3
FILE_PATH=./src/database/entities/${TABLE_NAME}.entity.ts

if [ -z $ENTITY_CLASS ]; then
  echo npm run generate:entity TableName table-name
  exit 0
fi

if [ -f "$FILE_PATH" ] && [ "$OVERWRITE" != "--overwrite" ]; then
  echo "Error: Entity file already exists at $FILE_PATH"
  echo "Use the --overwrite flag to overwrite existing files."
  exit 1
fi

echo "Generating entity for $ENTITY_CLASS at $FILE_PATH"

mkdir -p $(dirname "$FILE_PATH")

# The module file
cat <<EOF > $FILE_PATH
import {
  Column,
  DataType,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';

/**
 * The ${ENTITY_CLASS}Entity...
 */
@Table({
  tableName: '${TABLE_NAME/-/_}',
  timestamps: true,
  underscored: true,
})
export class ${ENTITY_CLASS}Entity extends Model<${ENTITY_CLASS}Entity> {
  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare readonly createdAt: Date;

  /**
   * The ID of the table row is an integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare readonly id: number;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
  })
  declare readonly updatedAt?: Date;
}
EOF
