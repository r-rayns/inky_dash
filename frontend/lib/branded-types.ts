// __brand has no runtime representation but is used to
// create a unique type marker that can be used for type checking our branded types
// doing it this way avoids Intellisense picking up on the __brand property
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
type Branded<T, B> = T & Brand<B>;

export type millisecond = Branded<number, 'millisecond'>;
export type second = Branded<number, 'second'>;
export type timestamp<T extends millisecond | second> = Branded<T, Brand<'timestamp'>>;
