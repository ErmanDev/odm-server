import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Officer from './Officer';

interface PendingActivityAttributes {
  id: number;
  officerName: string;
  department: string;
  activity: string;
  status: 'pending' | 'approved' | 'rejected';
  officerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PendingActivityCreationAttributes extends Optional<PendingActivityAttributes, 'id' | 'officerId' | 'createdAt' | 'updatedAt'> {}

class PendingActivity extends Model<PendingActivityAttributes, PendingActivityCreationAttributes> implements PendingActivityAttributes {
  public id!: number;
  public officerName!: string;
  public department!: string;
  public activity!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public officerId?: number;

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
    tableName: 'pending_activities',
    timestamps: true
  }
);

PendingActivity.belongsTo(Officer, { foreignKey: 'officerId', as: 'officer' });

export default PendingActivity;

