<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SocketMessage implements ShouldBroadcastNow // shouldbroadcast uses a queue, shouldbroadcast now immediately emits message
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {

    }

    public function broadcastWith(): array
    {
        return [
            'message' => new MessageResource($this->message)
        ];
    }

    public function broadcastOn()
    {
        $m = $this->message;

        $channels = [];

        if ($m->group_id) {
            $channels[] = new PrivateChannel('message.group.'.$m->group_id);
        } else {
            $channels[] = new PrivateChannel('message.user.'.collect([$m->sender_id, $m->receiver_id])->sort()->implode('-'));
        }

        return $channels;
    }
}
