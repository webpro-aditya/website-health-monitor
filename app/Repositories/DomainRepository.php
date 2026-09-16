<?php

namespace App\Repositories;

use App\Models\DomainUrl;
use App\Repositories\Interfaces\DomainRepositoryInterface;

class DomainRepository implements DomainRepositoryInterface
{
    public function getAllForUser(int $userId)
    {
        return DomainUrl::where('user_id', $userId)->orderBy('id', 'asc')->get();
    }

    public function findByIdAndUser(int $id, int $userId)
    {
        return DomainUrl::where('id', $id)->where('user_id', $userId)->first();
    }

    public function save(string $name, string $url, string $status, int $userId, ?int $id = null)
    {
        $domain = DomainUrl::updateOrCreate(
            ['id' => $id, 'user_id' => $userId],
            ['domain_name' => $name, 'url' => $url, 'status' => $status]
        );

        if (!$id) {
            $domain->check_interval = $domain->getIntervalForSubscription();
            $domain->next_check_at = now();
            $domain->save();
        }

        return $domain;
    }

    public function delete(int $id, int $userId)
    {
        return DomainUrl::where('id', $id)->where('user_id', $userId)->delete();
    }

    public function toggle(int $id, string $status, int $userId)
    {
        return DomainUrl::where('id', $id)->where('user_id', $userId)->update(['status' => $status]);
    }

    public function setAll(string $status, int $userId)
    {
        return DomainUrl::where('user_id', $userId)->update(['status' => $status]);
    }
}
