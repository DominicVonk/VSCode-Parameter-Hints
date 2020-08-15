module.exports.promiseList = () => {
    let list = [];
    return {
        done: async () => {
            if (list.length) {
                return await Promise.all(list.map(e => e.promise));
            }
            return true;
        },
        list: list,
        push: (promise) => {
            list.push(promise);
        },
        cancel: () => {
            list.forEach((promise) => {
                promise.reject();
            });
        }
    }
}