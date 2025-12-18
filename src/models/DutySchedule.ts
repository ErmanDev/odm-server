import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface DutyScheduleAttributes {
  id: number;
  date: Date;
  duty: string;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DutyScheduleCreationAttributes extends Optional<DutyScheduleAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

class DutySchedule extends Model<DutyScheduleAttributes, DutyScheduleCreationAttributes> implements DutyScheduleAttributes {
  public id!: number;
  public date!: Date;
  public duty!: string;
  public userId?: number;

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
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
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

DutySchedule.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default DutySchedule;

