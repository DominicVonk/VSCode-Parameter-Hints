module.exports.cancellablePromise = function cancellablePromise(promiseFunction, unregister) {
    let cancellable = {
    };
    let state = {
        rejected: false,
        resolved: false,
        done: false
    }
    let status = 'pending';
    let promise;
    let done = (force) => {
        if (unregister) {
            unregister(force, promise);
        }
    }
    let reject = (force) => {
        if (status === 'pending') {
            status = 'rejected';
            state.rejected = true;
            state.resolved = false;
            state.done = true;
            if (cancellable.reject) {
                cancellable.reject('cancelled');
            }
            if (force) {
                done(true);
            } else {
                done();
            }
        } else {
            console.log('already ' + status);
        }
    };
    let resolve = (e) => {
        if (status === 'pending') {
            status = 'resolved';
            cancellable.rejected = false;
            cancellable.resolved = true;
            state.done = true;
            if (cancellable.resolve) {
                cancellable.resolve(e);
            }
            done();
        } else {
            console.log('already ' + status);
        }
    }
    promise = new Promise(async (_resolve, _reject) => {
        cancellable.reject = _reject;
        cancellable.resolve = _resolve;

        await promiseFunction(resolve, reject, state);
    });

    promise.reject = reject;
    promise.resolve = resolve;
    promise.status = status;
    promise.state = state;
    return promise;
}