import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface OfficerAttributes {
  id: number;
  name: string;
  department: string;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OfficerCreationAttributes extends Optional<OfficerAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

class Officer extends Model<OfficerAttributes, OfficerCreationAttributes> implements OfficerAttributes {
  public id!: number;
  public name!: string;
  public department!: string;
  public userId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Officer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(255),
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
    tableName: 'officers',
    timestamps: true
  }
);

Officer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Officer;

