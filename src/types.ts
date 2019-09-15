export type ValueType = ArrayConstructor | ItemType;

export type ItemType = StringConstructor | NumberConstructor;

export const ValidValueTypes: ValueType[] = [
  Array,
  String,
  Number,
];

export const ValidItemTypes: ItemType[] = [String, Number];
