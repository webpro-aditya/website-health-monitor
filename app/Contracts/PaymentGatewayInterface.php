<?php

namespace App\Contracts;

interface PaymentGatewayInterface
{
    /**
     * Create a customer in the payment gateway.
     *
     * @param array $data
     * @return array
     */
    public function createCustomer(array $data): array;

    /**
     * Create a subscription for the customer.
     *
     * @param string $planId
     * @param int $totalCount
     * @return array
     */
    public function createSubscription(string $planId, int $totalCount = 12): array;

    /**
     * Verify the payment signature or webhook signature.
     *
     * @param array $attributes
     * @return bool
     */
    public function verifySignature(array $attributes): bool;

    /**
     * Get details of an active subscription.
     *
     * @param string $subscriptionId
     * @return array
     */
    public function getSubscription(string $subscriptionId): array;

    /**
     * Update an active subscription.
     *
     * @param string $subscriptionId
     * @param string $planId
     * @return array
     */
    public function updateSubscription(string $subscriptionId, string $planId): array;

    /**
     * Cancel an active subscription.
     *
     * @param string $subscriptionId
     * @return array
     */
    public function cancelSubscription(string $subscriptionId): array;
}
