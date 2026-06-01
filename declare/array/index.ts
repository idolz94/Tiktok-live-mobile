/* eslint-disable no-extend-native */
export {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Array.prototype.first = function (defaultValue: any) {
  return this[0] || defaultValue || undefined;
};

Array.prototype.searchAllProps = function (keyword: string | number) {
  return this.filter(x => {
    return Object.keys(x).some(function (key) {
      return (
        String(x[key]).changeAlias().search(String(keyword).changeAlias()) !==
        -1
      );
    });
  });
};

Array.prototype.findMin = function (path) {
  if (this.length === 0) {
    return undefined;
  }

  let lowestVal = Number.POSITIVE_INFINITY;
  let lowestIdx = -1;
  let tmp;

  for (let i = this.length - 1; i >= 0; i--) {
    tmp = getProperty(this[i], path);
    if (tmp < lowestVal) {
      lowestVal = tmp;
      lowestIdx = i;
    }
  }

  return this[lowestIdx];
};

Array.prototype.findMax = function (path) {
  if (this.length === 0) {
    return undefined;
  }

  let lowestVal = Number.NEGATIVE_INFINITY;
  let lowestIdx = -1;
  let tmp;

  for (let i = this.length - 1; i >= 0; i--) {
    tmp = getProperty(this[i], path);
    if (tmp > lowestVal) {
      lowestVal = tmp;
      lowestIdx = i;
    }
  }

  return this[lowestIdx];
};

function getProperty<T>(obj: T, path: string) {
  const properties = path.split('.');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return properties.reduce((prev, curr) => prev && prev[curr], obj);
}

Array.prototype.findLastIndex = function (predicate, thisArg) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (predicate.call(thisArg, this[i], i, this)) {
      return i;
    }
  }
  return -1;
};
