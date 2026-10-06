// Checks whether two orders belong to the same customer
// and have the same delivery address.
function canCombineOrders(order1, order2) {
    return (
        order1.customerId === order2.customerId &&
        order1.addressId === order2.addressId
    );
}

// Checks whether two orders were placed within 10 minutes of each other.
function isWithinTimeWindow(order1, order2) {
    const timeDifference = Math.abs(
        order1.orderTime - order2.orderTime
    );

    const tenMinutes = 10 * 60 * 1000;

    return timeDifference <= tenMinutes;
}

// Checks whether a rider has space for one more order.
function hasRiderCapacity(rider, currentOrderCount) {
    return currentOrderCount < rider.capacity;
}

// Checks whether the expected delivery time meets the order's SLA.
function meetsSLA(order, expectedDeliveryTime) {
    return expectedDeliveryTime <= order.promisedDeliveryTime;
}

// Checks whether an order is still eligible for batching.
// Dispatched orders cannot be added to a new batch.
function canBeBatched(order) {
    return order.status !== "dispatched";
}

// Checks all conditions required to batch two orders.
function canBatchOrders(
    order1,
    order2,
    rider,
    currentOrderCount,
    expectedDeliveryTime
) {
    return (
        canCombineOrders(order1, order2) &&
        isWithinTimeWindow(order1, order2) &&
        canBeBatched(order1) &&
        canBeBatched(order2) &&
        hasRiderCapacity(rider, currentOrderCount) &&
        meetsSLA(order1, expectedDeliveryTime) &&
        meetsSLA(order2, expectedDeliveryTime)
    );
}

// Export batching functions so other backend files can use them.
module.exports = {
    canCombineOrders,
    isWithinTimeWindow,
    canBeBatched,
    hasRiderCapacity,
    meetsSLA,
    canBatchOrders
};