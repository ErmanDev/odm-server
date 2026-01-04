import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ClockSettingsAttributes {
  id: number;
  clockInStartTime: string; // TIME format: HH:MM:SS
  clockOutStartTime: string; // TIME format: HH:MM:SS
  isActive: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClockSettingsCreationAttributes extends Optional<ClockSettingsAttributes, 'id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'> {}

class ClockSettings extends Model<ClockSettingsAttributes, ClockSettingsCreationAttributes> implements ClockSettingsAttributes {
  public id!: number;
  public clockInStartTime!: string;
  public clockOutStartTime!: string;
  public isActive!: boolean;
  public createdBy?: number;
  public updatedBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClockSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    clockInStartTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    clockOutStartTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'clock_settings',
    timestamps: true
  }
);

// Associations
ClockSettings.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
ClockSettings.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

export default ClockSettings;

