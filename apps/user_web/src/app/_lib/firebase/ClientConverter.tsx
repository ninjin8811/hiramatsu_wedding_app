import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  getFirestore,
  collection,
  doc,
  collectionGroup,
  Timestamp,
} from "firebase/firestore";
import { z } from "zod";

export type GetAppModelType<T> = {
  snapshot: QueryDocumentSnapshot;
  createdAt: Date;
  updatedAt: Date;
} & T;

type SetAppModelType<T> = {
  snapshot?: QueryDocumentSnapshot;
  createdAt?: Date;
  updatedAt?: Date;
} & T;

export type ClientDbModelType<T> = {
  createdAt: Timestamp;
  updatedAt: Timestamp;
} & T;

export const clientConverterOnGet = <T extends z.AnyZodObject>(
  schema: T
): FirestoreDataConverter<GetAppModelType<z.infer<T>>> => ({
  toFirestore: () => {
    throw new Error("Use clientConverterOnSet on SET operations");
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<
      GetAppModelType<z.infer<T>>,
      ClientDbModelType<z.infer<T>>
    >
  ): GetAppModelType<z.infer<T>> => {
    const createdAt = snapshot.get("createdAt");
    const updatedAt = snapshot.get("updatedAt");
    const { createdAt: _c, updatedAt: _u, ...data } = snapshot.data();
    const parsedData = schema.parse(data);
    return {
      ...parsedData,
      snapshot,
      createdAt: createdAt.toDate(),
      updatedAt: updatedAt.toDate(),
    };
  },
});

export const clientConverterOnSet = <T extends z.AnyZodObject>(
  schema: T
): FirestoreDataConverter<SetAppModelType<z.infer<T>>> => ({
  toFirestore: (data: SetAppModelType<z.infer<T>>) => {
    const { snapshot: _s, createdAt, updatedAt: _u, ...rest } = data;
    const result = schema.strict().parse(rest);
    return {
      ...result,
      createdAt: createdAt ?? new Date(),
      updatedAt: new Date(),
    };
  },
  fromFirestore: () => {
    throw new Error("Use clientConverterOnSet on SET operations");
  },
});

export function collectionSet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string
) {
  return collection(getFirestore(), collectionPath).withConverter(
    clientConverterOnSet(schema)
  );
}

export function collectionGet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string
) {
  return collection(getFirestore(), collectionPath).withConverter(
    clientConverterOnGet(schema)
  );
}

export function collectionGroupGet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string
) {
  return collectionGroup(getFirestore(), collectionPath).withConverter(
    clientConverterOnGet(schema)
  );
}

export function documentGet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string,
  documentPath: string
) {
  return doc(collectionGet(schema, collectionPath), documentPath);
}

export function documentSet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string,
  documentPath: string
) {
  return doc(collectionSet(schema, collectionPath), documentPath);
}
