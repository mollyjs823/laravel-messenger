<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::channel('online', function (User $user) {
//    Log::info("user: ", ['user' => $user->id]);
    return $user ? new UserResource($user) : null;
});


Broadcast::channel('message.user.{userId1}-{userId2}', function (User $user, int $userId1, int $userId2) {
    return $user->id === $userId1 || $user->id === $userId2 ? $user : null;
}); // user id 1 should always be less than user id 2 to prevent channel duplication

Broadcast::channel('message.group.{groupId}', function (User $user, int $groupId) {
   return $user->groups->contains('id', $groupId) ? $user : null;
});
