import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface DutyAssignmentAttributes {
  id: number;
  date: Date;
  officerName: string;
  department: string;
  taskLocation: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DutyAssignmentCreationAttributes extends Optional<DutyAssignmentAttributes, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

class DutyAssignment extends Model<DutyAssignmentAttributes, DutyAssignmentCreationAttributes> implements DutyAssignmentAttributes {
  public id!: number;
  public date!: Date;
  public officerName!: string;
  public department!: string;
  public taskLocation!: string;
  public status!: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  public userId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DutyAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    officerName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    taskLocation: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'ongoing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    userId: {
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
    tableName: 'duty_assignments',
    timestamps: true
  }
);

DutyAssignment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default DutyAssignment;

