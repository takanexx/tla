import { Realm } from '@realm/react';

/* 設定はユーザーに持たせているのでなしとする */
/*
export class Setting extends Realm.Object<Setting> {
  _id!: Realm.BSON.ObjectId;
  theme!: string;
  createdAt!: Date;

  static generate() {
    return {
      _id: new Realm.BSON.ObjectId(),
      theme: 'light',
      createdAt: new Date(),
    };
  }

  static schema: Realm.ObjectSchema = {
    name: 'Setting',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      theme: 'string',
      createdAt: 'date',
    },
  };
}
*/

export class User extends Realm.Object<User> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  email!: string;
  theme!: string;
  createdAt!: Date;

  static generate(params: { name?: string; email?: string } = {}) {
    return {
      _id: new Realm.BSON.ObjectId(),
      name: params.name,
      email: params.email,
      theme: 'light',
      createdAt: new Date(),
    };
  }

  static schema: Realm.ObjectSchema = {
    name: 'User',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      name: 'string',
      email: 'string',
      theme: 'string',
      createdAt: 'date',
    },
  };
}

export class Record extends Realm.Object<Record> {
  _id!: Realm.BSON.ObjectId;
  userId!: string;
  startedAt!: Date;
  endedAt!: Date;

  static generate(params: { userId?: string } = {}) {
    return {
      _id: new Realm.BSON.ObjectId(),
      userId: params.userId,
      startedAt: new Date(),
      endedAt: new Date(),
    };
  }

  static schema: Realm.ObjectSchema = {
    name: 'Record',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      userId: 'string',
      startedAt: 'date',
      endedAt: 'date',
    },
  };
}

export class ExamResult extends Realm.Object<ExamResult> {
  score!: number;
  date!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'ExamResult',
    embedded: true,
    properties: {
      score: 'int',
      date: 'date',
    },
  };
}

export class Exam extends Realm.Object<Exam> {
  _id!: Realm.BSON.ObjectId;
  userId!: string;
  title!: string;
  results!: ExamResult[];
  createdAt!: Date;

  static generate(params: { userId?: string; title?: string; results?: Array<ExamResult> } = {}) {
    return {
      _id: new Realm.BSON.ObjectId(),
      userId: params.userId,
      title: params.title,
      results: [],
      createdAt: new Date(),
    };
  }

  static schema: Realm.ObjectSchema = {
    name: 'Exam',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      userId: 'string',
      title: 'string',
      results: { type: 'list', objectType: 'ExamResult' },
      createdAt: 'date',
    },
  };
}
