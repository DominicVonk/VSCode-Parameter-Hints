const { cancellablePromise } = require("./cancellablePromise");

function pipe(action, condition, previousPromise, broken = false) {
    let next = null;
    let promise;
    let runningPromise = previousPromise;
    if (!broken) {
        promise = () => {
            runningPromise = cancellablePromise(async (resolve, reject, state) => {
                try {
                    let output = await action();
                    resolve(output);
                } catch (e) {
                    if (e === 'cancelled') {
                        reject();
                    } else {
                        if (next) {
                            resolve(next.runPromise());
                        } else {
                            resolve(false);
                        }
                    }
                }
            });
            return runningPromise;
        }
    } else {
        promise = () => {
            runningPromise = cancellablePromise(async (resolve, reject, state) => {
                reject();
            });
            return runningPromise;
        }
    }
    return {
        pipe(action) {
            next = pipe(action, condition, runningPromise, broken);
            return next;
        },
        reject() {
            runningPromise && runningPromise.reject(true);
        },
        runPromise: promise,
        promise: runningPromise
    }
}

module.exports.promisable = function promisable(action, condition) {
    let next = null;
    let interval;
    let promise = cancellablePromise(async (resolve, reject, state) => {
        try {
            let output = await action(state);
            if (!output) {
                throw new Error('')
            } else {
                resolve(output);
            }

        } catch (e) {
            if (e === 'cancelled') {
                reject();
            } else {
                if (next) {
                    resolve(next.runPromise());
                } else {
                    resolve(false);
                }
            }
        }
    }, () => {
        if (interval) {
            clearInterval(interval);
        }
    })
    if (condition) {
        interval = setInterval(() => {
            if (condition()) {
                !promise.state.done && promise.reject(true);
            }
        }, 16);
    }

    return {
        pipe(action) {
            next = pipe(action, condition, promise, condition && condition());
            return next;
        },
        promise,
        reject() {
            promise.reject(true);
        }
    }
}

module.exports.promisableOne = function promisableOne(action, condition) {
    let interval;
    let promise = cancellablePromise(async (resolve, reject, state) => {
        try {
            let output = await action(state);
            resolve(output);

        } catch (e) {
            reject();
        }
    }, () => {
        if (interval) {
            clearInterval(interval);
        }
    })
    if (condition) {
        interval = setInterval(() => {
            if (condition()) {
                !promise.state.done && promise.reject(true);
            }
        }, 16);
    }

    return {
        promise,
        reject() {
            promise.reject(true);
        }
    }
}