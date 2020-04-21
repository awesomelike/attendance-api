export const idOf = (object) => object.id;
export default (object, key) => Object.entries(object)
  .find((element) => element[1].id === key.id)[1].id;
