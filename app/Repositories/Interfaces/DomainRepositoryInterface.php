<?php

namespace App\Repositories\Interfaces;

interface DomainRepositoryInterface
{
    public function getAllForUser(int $userId);
    public function save(string $name, string $url, string $status, int $userId, ?int $id = null);
    public function delete(int $id, int $userId);
    public function toggle(int $id, string $status, int $userId);
    public function setAll(string $status, int $userId);
}
