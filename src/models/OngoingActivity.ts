import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Officer from './Officer';

interface OngoingActivityAttributes {
  id: number;
  date: Date;
  task: string;
  location: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  action: string;
  officerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OngoingActivityCreationAttributes extends Optional<OngoingActivityAttributes, 'id' | 'officerId' | 'createdAt' | 'updatedAt'> {}

class OngoingActivity extends Model<OngoingActivityAttributes, OngoingActivityCreationAttributes> implements OngoingActivityAttributes {
  public id!: number;
  public date!: Date;
  public task!: string;
  public location!: string;
  public status!: 'in-progress' | 'completed' | 'on-hold';
  public action!: string;
  public officerId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OngoingActivity.init(
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
    task: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('in-progress', 'completed', 'on-hold'),
      allowNull: false,
      defaultValue: 'in-progress'
    },
    action: {
      type: DataTypes.STRING(255),
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
    tableName: 'ongoing_activities',
    timestamps: true
  }
);

OngoingActivity.belongsTo(Officer, { foreignKey: 'officerId', as: 'officer' });

export default OngoingActivity;

