import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Officer from './Officer';

interface DutyScheduleAttributes {
  id: number;
  date: Date;
  duty: string;
  officerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DutyScheduleCreationAttributes extends Optional<DutyScheduleAttributes, 'id' | 'officerId' | 'createdAt' | 'updatedAt'> {}

class DutySchedule extends Model<DutyScheduleAttributes, DutyScheduleCreationAttributes> implements DutyScheduleAttributes {
  public id!: number;
  public date!: Date;
  public duty!: string;
  public officerId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DutySchedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duty: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    officerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'officers',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'duty_schedules',
    timestamps: true
  }
);

DutySchedule.belongsTo(Officer, { foreignKey: 'officerId', as: 'officer' });

export default DutySchedule;

