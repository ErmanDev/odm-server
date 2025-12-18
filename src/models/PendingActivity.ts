import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface PendingActivityAttributes {
  id: number;
  officerName: string;
  department: string;
  activity: string;
  status: 'pending' | 'approved' | 'rejected';
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PendingActivityCreationAttributes extends Optional<PendingActivityAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

class PendingActivity extends Model<PendingActivityAttributes, PendingActivityCreationAttributes> implements PendingActivityAttributes {
  public id!: number;
  public officerName!: string;
  public department!: string;
  public activity!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public userId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PendingActivity.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    officerName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activity: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
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
    tableName: 'pending_activities',
    timestamps: true
  }
);

PendingActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default PendingActivity;

