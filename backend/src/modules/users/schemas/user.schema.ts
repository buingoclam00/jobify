import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  resumeUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);