import Avatar from "boring-avatars";

interface UserAvatarProps {
  /** Stable identifier used to generate the fallback avatar (e.g. user id). */
  seed: string;
  /** Optional uploaded profile picture; takes precedence when non-empty. */
  avatarUrl?: string | null;
  /** Diameter in pixels. */
  size?: number;
  className?: string;
}

/**
 * A circular user avatar, the web port of the kced_mobile UserAvatar widget:
 * shows the profile picture when present, otherwise a deterministic marble
 * Boring Avatar seeded by the user's id so it's stable per user.
 */
export function UserAvatar({ seed, avatarUrl, size = 40, className }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Avatar name={seed} variant="marble" size={size} />
    </span>
  );
}
