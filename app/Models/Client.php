<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Eloquent model for the `clients` table.
 *
 * Represents a real-world client entity extracted during 3NF normalisation.
 * A single Client row can be referenced by many Appointment rows,
 * demonstrating a proper 1-to-Many (hasMany) relationship.
 *
 * @property int    $id
 * @property string $name
 */
class Client extends Model
{
    /**
     * The attributes that are mass-assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['name'];

    /**
     * A client can have many appointments over time.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}
