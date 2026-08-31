type AvatarProps = {
  initials: string;
  tone?: string;
  size?: "sm" | "md";
};

export default function Avatar({ initials, tone = "sage", size = "md" }: AvatarProps) {
  return (
    <span className={`avatar avatar--${tone} avatar--${size}`} aria-label={initials}>
      {initials}
    </span>
  );
}
