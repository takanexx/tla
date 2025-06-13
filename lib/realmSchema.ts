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
  plan!: number;
  createdAt!: Date;

  static generate(params: { name?: string; email?: string } = {}) {
    return {
      _id: new Realm.BSON.ObjectId(),
      name: params.name,
      email: params.email,
      theme: 'light',
      plan: 1, // 1: Free, 2: Pro
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
      plan: 'int',
      createdAt: 'date',
    },
  };
}

export class Record extends Realm.Object<Record> {
  _id!: Realm.BSON.ObjectId;
  userId!: string;
  routineId!: string;
  title!: string;
  date!: Date;
  color!: string;
  startedAt!: Date;
  endedAt!: Date;

  static generate(
    params: {
      userId?: string;
      routineId?: string;
      title?: string;
      date?: Date;
      color?: string;
      startedAt?: Date;
      endedAt?: Date;
    } = {},
  ) {
    return {
      _id: new Realm.BSON.ObjectId(),
      userId: params.userId,
      routineId: params.routineId || null,
      title: params.title || '',
      date: params.date || null,
      color: params.color,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
    };
  }

  static schema: Realm.ObjectSchema = {
    name: 'Record',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      userId: { type: 'string', indexed: true },
      routineId: { type: 'string', optional: true, indexed: true },
      title: 'string',
      date: { type: 'date', optional: true, indexed: true },
      color: 'string',
      startedAt: 'date',
      endedAt: 'date',
    },
  };
}

export class Routine extends Realm.Object<Routine> {
  _id!: Realm.BSON.ObjectId;
  userId!: string;
  title!: string;
  cycle!: string;
  cycleValue!: string;
  color!: string;
  startedAt!: Date;
  endedAt!: Date;

  static generate(params: {
    userId: string;
    title?: string;
    cycle?: string;
    cycleValue?: string;
    color?: string;
    startedAt?: Date;
    endedAt?: Date;
  }) {
    return {
      _id: new Realm.BSON.ObjectId(),
      userId: params.userId,
      title: params.title || '',
      cycle: params.cycle || 'everyday',
      cycleValue: params.cycleValue || '',
      color: params.color || 'red',
      startedAt: params.startedAt,
      endedAt: params.endedAt,
    };
  }

  static schema: Realm.ObjectSchema = {
    name: 'Routine',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      userId: 'string',
      title: 'string',
      cycle: 'string',
      cycleValue: 'string',
      color: 'string',
      startedAt: 'date',
      endedAt: 'date',
    },
  };
}

export class ExamResult extends Realm.Object<ExamResult> {
  score!: number;
  date!: Date;

  static generate(params: { score?: number; date?: Date } = {}) {
    return {
      score: params.score,
      date: params.date,
    };
  }

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
  results!: Realm.List<ExamResult>;
  createdAt!: Date;

  static generate(params: { userId?: string; title?: string; results?: Array<ExamResult> } = {}) {
    return {
      _id: new Realm.BSON.ObjectId(),
      userId: params.userId,
      title: params.title,
      results: params.results,
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
