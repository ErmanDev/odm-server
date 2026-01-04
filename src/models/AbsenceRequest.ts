import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface AbsenceRequestAttributes {
  id: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface AbsenceRequestCreationAttributes extends Optional<AbsenceRequestAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class AbsenceRequest extends Model<AbsenceRequestAttributes, AbsenceRequestCreationAttributes> implements AbsenceRequestAttributes {
  public id!: number;
  public userId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public reason!: string;
  public status!: 'pending' | 'approved' | 'rejected';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AbsenceRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    }
  },
  {
    sequelize,
    tableName: 'absence_requests',
    timestamps: true
  }
);

AbsenceRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AbsenceRequest, { foreignKey: 'userId', as: 'absenceRequests' });

export default AbsenceRequest;

