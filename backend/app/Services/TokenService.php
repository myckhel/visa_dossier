<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class TokenService
{
    /**
     * @param User $user
     * @return Collection<int, PersonalAccessToken>
     */
    public function getUserTokens(User $user): Collection
    {
        return $user->tokens;
    }

    /**
     * @param User $user
     * @param string $name
     * @param array<string> $abilities
     * @return string
     */
    public function createToken(User $user, string $name, array $abilities = ['*']): string
    {
        return $user->createToken($name, $abilities)->plainTextToken;
    }

    /**
     * @param User $user
     * @param int $tokenId
     * @throws ValidationException
     */
    public function revokeToken(User $user, int $tokenId): void
    {
        $token = $user->tokens()->where('id', $tokenId)->first();

        if (!$token) {
            throw ValidationException::withMessages([
                'token' => 'Token not found or does not belong to the user.',
            ]);
        }

        $token->delete();
    }

    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * @param User $user
     * @param string $tokenName
     */
    public function revokeTokenByName(User $user, string $tokenName): void
    {
        $user->tokens()->where('name', $tokenName)->delete();
    }
}
