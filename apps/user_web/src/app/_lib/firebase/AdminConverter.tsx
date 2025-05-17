import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  getFirestore,
} from "firebase-admin/firestore";
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

export type AdminDbModelType<T> = {
  createdAt: Date;
  updatedAt: Date;
} & T;

export const adminConverterOnGet = <T extends z.AnyZodObject>(
  schema: T
): FirestoreDataConverter<GetAppModelType<z.infer<T>>> => {
  return {
    toFirestore: () => {
      throw new Error("Use adminConverterOnSet on SET operations");
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<GetAppModelType<z.infer<T>>>
    ): GetAppModelType<z.infer<T>> => {
      const createdAt = snapshot.get("createdAt");
      const updatedAt = snapshot.get("updatedAt");
      const { createdAt: _c, updatedAt: _u, ...data } = snapshot.data();
      const parsedData = schema.strict().parse(data);
      return {
        ...parsedData,
        snapshot,
        createdAt: createdAt.toDate(),
        updatedAt: updatedAt.toDate(),
      };
    },
  };
};

export const adminConverterOnSet = <T extends z.AnyZodObject>(
  schema: T
): FirestoreDataConverter<SetAppModelType<z.infer<T>>> => {
  return {
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
      throw new Error("Use adminConverterOnSet on SET operations");
    },
  };
};

export function collectionSet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string
) {
  return getFirestore()
    .collection(collectionPath)
    .withConverter(adminConverterOnSet(schema));
}

export function collectionGet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string
) {
  return getFirestore()
    .collection(collectionPath)
    .withConverter(adminConverterOnGet(schema));
}

export function collectionGroupGet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string
) {
  return getFirestore()
    .collectionGroup(collectionPath)
    .withConverter(adminConverterOnGet(schema));
}

export function documentGet<T extends z.AnyZodObject>(
  schema: T,
  collectionPath: string,
  documentPath: string
) {
  return getFirestore()
    .collection(collectionPath)
    .doc(documentPath)
    .withConverter(adminConverterOnGet(schema));
}

export function documentSet(
  schema: z.AnyZodObject,
  collectionPath: string,
  documentPath: string
) {
  return getFirestore()
    .collection(collectionPath)
    .doc(documentPath)
    .withConverter(adminConverterOnSet(schema));
}
