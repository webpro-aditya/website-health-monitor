<?php

namespace App\Repositories;

use App\Models\DomainUrl;
use App\Repositories\Interfaces\DomainRepositoryInterface;

class DomainRepository implements DomainRepositoryInterface
{
    public function getAllForUser(int $userId)
    {
        $user = \App\Models\User::find($userId);
        $limit = $user ? $user->getMaxDomainsLimit() : 2;
        $domains = DomainUrl::where('user_id', $userId)->orderBy('id', 'asc')->get();
        
        $activeCount = 0;
        
        return $domains->map(function ($domain) use (&$activeCount, $limit) {
            $statusFlag = 'DISABLED';
            if ($domain->status === 'enabled') {
                if ($activeCount >= $limit) {
                    $statusFlag = 'FROZEN';
                } else {
                    $activeCount++;
                    if (is_null($domain->last_checked)) {
                        $statusFlag = 'PENDING';
                    } else {
                        $statusFlag = $domain->domain_status ? 'UP' : 'DOWN';
                    }
                }
            }

            return [
                'id'       => $domain->id,
                'name'     => $domain->domain_name ?? 'Unknown',
                'url'      => $domain->url,
                'status'   => $statusFlag,
                'enabled'  => $domain->status === 'enabled',
                'response' => $domain->response_time ? round($domain->response_time) . 'ms' : '--',
                'checked'  => $domain->last_checked ? $domain->last_checked->format('Y-m-d H:i') : 'Never'
            ];
        })->sortByDesc('id')->values();
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
