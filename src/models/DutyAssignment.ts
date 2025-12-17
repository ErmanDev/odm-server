import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Officer from './Officer';

interface DutyAssignmentAttributes {
  id: number;
  date: Date;
  officerName: string;
  department: string;
  taskLocation: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  officerId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DutyAssignmentCreationAttributes extends Optional<DutyAssignmentAttributes, 'id' | 'officerId' | 'createdAt' | 'updatedAt'> {}

class DutyAssignment extends Model<DutyAssignmentAttributes, DutyAssignmentCreationAttributes> implements DutyAssignmentAttributes {
  public id!: number;
  public date!: Date;
  public officerName!: string;
  public department!: string;
  public taskLocation!: string;
  public status!: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  public officerId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DutyAssignment.init(
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
    tableName: 'duty_assignments',
    timestamps: true
  }
);

DutyAssignment.belongsTo(Officer, { foreignKey: 'officerId', as: 'officer' });

export default DutyAssignment;

