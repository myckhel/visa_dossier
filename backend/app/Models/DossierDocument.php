<?php

namespace App\Models;

use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class DossierDocument extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'dossier_id',
        'document_type',
        'name',
        'description',
        'file_size',
        'mime_type',
        'original_filename',
    ];

    protected $casts = [
        'document_type' => DocumentType::class,
        'file_size' => 'integer',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(VisaDossier::class, 'dossier_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function registerMediaCollections(): void
    {
        $collection = $this->addMediaCollection('documents');

        // Only apply strict mime type validation in production
        if (app()->environment('production')) {
            $collection->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);
        }
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Skip conversions in testing environment to avoid file path issues
        if (app()->environment('testing')) {
            return;
        }

        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10)
            ->performOnCollections('documents');
    }
}
