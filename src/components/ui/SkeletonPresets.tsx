import { CustomCard } from './CustomCard';
import { CustomSkeleton } from './CustomSkeleton';
import type { CardPadding, CardShadow } from './CustomCard';

interface SkeletonCardProps {
  withIcon?: boolean;
  padding?: CardPadding;
  shadow?: CardShadow;
}

export function SkeletonCard({
  withIcon = true,
  padding = 'md',
  shadow = 'md',
}: SkeletonCardProps) {
  return (
    <CustomCard padding={padding} shadow={shadow}>
      <div className="flex flex-col gap-3">
        {withIcon && (
          <CustomSkeleton variant="circle" size="md" animation="shimmer" />
        )}
        <CustomSkeleton
          variant="text"
          size="lg"
          width="60%"
          animation="shimmer"
        />
        <CustomSkeleton variant="text" count={2} animation="shimmer" />
      </div>
    </CustomCard>
  );
}

interface SkeletonListItemProps {
  avatarSize?: 'sm' | 'md' | 'lg';
}

export function SkeletonListItem({ avatarSize = 'md' }: SkeletonListItemProps) {
  return (
    <div className="flex items-center gap-3.5">
      <CustomSkeleton variant="circle" size={avatarSize} animation="shimmer" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <CustomSkeleton variant="text" width="45%" animation="shimmer" />
        <CustomSkeleton
          variant="text"
          size="sm"
          width="70%"
          animation="shimmer"
        />
      </div>
    </div>
  );
}

interface SkeletonStatProps {
  padding?: CardPadding;
  shadow?: CardShadow;
}

export function SkeletonStat({
  padding = 'md',
  shadow = 'md',
}: SkeletonStatProps) {
  return (
    <CustomCard padding={padding} shadow={shadow}>
      <div className="flex flex-col gap-2">
        <CustomSkeleton
          variant="rect"
          width={40}
          height={40}
          rounded="md"
          animation="shimmer"
        />
        <CustomSkeleton
          variant="text"
          height="2.2rem"
          width="50%"
          animation="shimmer"
        />
        <CustomSkeleton
          variant="text"
          size="sm"
          width="65%"
          animation="shimmer"
        />
      </div>
    </CustomCard>
  );
}
