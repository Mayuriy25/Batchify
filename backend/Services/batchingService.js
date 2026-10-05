// Checks whether two orders belong to the same customer
// and have the same delivery address.
function canCombineOrders(order1, order2) {
    return (
        order1.customerId === order2.customerId &&
        order1.addressId === order2.addressId
    );
}

module.exports = {
    canCombineOrders
};

const order1 = {
    customerId: "CUST001",
    addressId: "ADDR001"
};

const order2 = {
    customerId: "CUST001",
    addressId: "ADDR001"
};

console.log(canCombineOrders(order1, order2));