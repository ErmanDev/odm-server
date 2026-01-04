import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'supervisor' | 'officer';
  fullName?: string;
  department?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'fullName' | 'department' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public role!: 'admin' | 'supervisor' | 'officer';
  public fullName?: string;
  public department?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'supervisor', 'officer'),
      allowNull: false,
      defaultValue: 'officer'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isRequiredForSupervisor(value: string | undefined) {
          if (this.role === 'supervisor' && !value) {
            throw new Error('Department is required for supervisors');
          }
        }
      }
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        // Validate supervisor must have department
        if (user.role === 'supervisor' && !user.department) {
          throw new Error('Department is required for supervisors');
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        // Validate supervisor must have department
        if (user.role === 'supervisor' && !user.department) {
          throw new Error('Department is required for supervisors');
        }
      }
    }
  }
);

export default User;

