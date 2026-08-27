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
        return DomainUrl::updateOrCreate(
            ['id' => $id, 'user_id' => $userId],
            ['domain_name' => $name, 'url' => $url, 'status' => $status]
        );
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
