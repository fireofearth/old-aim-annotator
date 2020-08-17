class PathViewerException extends Error {
    constructor(message) {
        super(message);
        this.code = 'PATHVIEWER';
    }
}

const debug = (...args) => {
    console.log(args.reduce((acc, arg) => {
        return acc + ` ${arg}`
    }, '<DEBUG>:'));
};

const showError = (err) => {
  if(err instanceof Error) { err = `${err.code}: ${err.message}`; }
  console.error(`<ERR>: ${err}`);
};

const isArray = (a) => {
	return Array.isArray(a);
};

const isNonemptyArray = (a) => {
	return Array.isArray(a) && a.length;
};

const union = (setA, setB) => {
    const _union = new Set(setA);
    setB.forEach(elem => {
        _union.add(elem);
    });
    return _union;
}

const intersection = (setA, setB) => {
    const _intersection = new Set();
    setB.forEach(elem => {
        if(setA.has(elem))
            _intersection.add(elem);
    });
    return _intersection;
}

const difference = (setA, setB) => {
    const _difference = new Set(setA);
    setB.forEach(elem => {
        _difference.delete(elem);
    });
    return _difference;
}

const getCookie = (name) => {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if(parts.length == 2)
        return parts.pop().split(";").shift();
    else
        throw PathViewerException("the cookie is malformed");
}

export { PathViewerException, debug, showError, getCookie, union, isArray, isNonemptyArray, intersection, difference };