<?php

namespace App\Repositories;

use App\Models\DomainUrl;
use App\Repositories\Interfaces\DomainRepositoryInterface;

class DomainRepository implements DomainRepositoryInterface
{
    public function getAllForUser(int $userId)
    {
        $domains = DomainUrl::where('user_id', $userId)->orderByDesc('id')->get();
        
        return $domains->map(function ($domain) {
            $statusFlag = 'DISABLED';
            if ($domain->status === 'enabled') {
                $statusFlag = $domain->domain_status ? 'UP' : 'DOWN';
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
        });
    }

    public function save(string $name, string $url, string $status, int $userId, ?int $id = null)
    {
        $interval = 900; // default 15min
        if (!$id) {
            $user = \App\Models\User::find($userId);
            if ($user) {
                $sub = $user->subscriptions()->where('status', 'active')->first();
                if ($sub) {
                    if (str_contains(strtolower($sub->plan_name), 'starter')) {
                        $interval = 300; // 5min
                    } elseif (str_contains(strtolower($sub->plan_name), 'pro') || str_contains(strtolower($sub->plan_name), 'enterprise')) {
                        $interval = 60; // 1min
                    }
                }
            }
        }

        $domain = DomainUrl::updateOrCreate(
            ['id' => $id, 'user_id' => $userId],
            ['domain_name' => $name, 'url' => $url, 'status' => $status]
        );

        if (!$id) {
            $domain->check_interval = $interval;
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
