<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Eloquent model for the `appointments` table.
 *
 * Each appointment belongs to exactly one Client row (belongsTo).
 * The client's name is accessible via the `client` relationship,
 * and the repository flattens it back to `client_name` in the
 * array it returns, keeping the rest of the application unchanged.
 *
 * @property int         $id
 * @property int         $client_id
 * @property string      $date    (Y-m-d)
 * @property string      $time    (H:i)
 * @property string      $status  (upcoming | completed | cancelled)
 * @property float|null  $income
 * @property-read Client $client
 */
class Appointment extends Model
{
    /**
     * The attributes that are mass-assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'client_id',
        'date',
        'time',
        'status',
        'income',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'income' => 'float',
    ];

    /**
     * Each appointment belongs to one client.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
