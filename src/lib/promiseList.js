module.exports.promiseList = () => {
    let list = [];
    return {
        done: async () => {
            return await Promise.all(list.map(e => e.promise));
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