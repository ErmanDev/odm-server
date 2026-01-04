import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface AttendanceAttributes {
  id: number;
  userId: number;
  clockIn: Date;
  clockOut?: Date;
  date: Date;
  status: 'clocked-in' | 'clocked-out';
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id' | 'clockOut' | 'createdAt' | 'updatedAt'> {}

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  public id!: number;
  public userId!: number;
  public clockIn!: Date;
  public clockOut?: Date;
  public date!: Date;
  public status!: 'clocked-in' | 'clocked-out';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
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
    clockIn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('clocked-in', 'clocked-out'),
      allowNull: false,
      defaultValue: 'clocked-in'
    }
  },
  {
    sequelize,
    tableName: 'attendance',
    timestamps: true
  }
);

Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendances' });

export default Attendance;

