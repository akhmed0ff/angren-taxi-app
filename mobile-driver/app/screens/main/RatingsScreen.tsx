import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSummary, appendReviews, setLoading } from '../../store/slices/ratings.slice';
import { ratingsService } from '../../services/ratings.service';
import { Review } from '../../types';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

const STARS = [5, 4, 3, 2, 1] as const;

const RatingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { summary, isLoading } = useAppSelector((state) => state.ratings);
  const [page, setPage] = React.useState(1);

  const loadRatings = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await ratingsService.getRatings();
      dispatch(setSummary(data));
      setPage(1);
    } catch {
      // silent
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const loadMoreReviews = useCallback(async () => {
    try {
      const reviews = await ratingsService.getReviews(page + 1);
      dispatch(appendReviews(reviews));
      setPage((p) => p + 1);
    } catch {
      // silent
    }
  }, [dispatch, page]);

  useEffect(() => {
    void loadRatings();
  }, [loadRatings]);

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {item.passenger.firstName?.[0]}
          </Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>
            {item.passenger.firstName} {item.passenger.lastName}
          </Text>
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.reviewRating}>
          {'⭐'.repeat(item.rating)}
        </Text>
      </View>
      {item.comment ? (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      ) : null}
      {item.tags && item.tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{t(`ratings.tags.${tag}`)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header title={t('ratings.title')} showBack />
      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={summary?.reviews ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRatings} />}
          onEndReached={loadMoreReviews}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            summary ? (
              <View style={styles.header}>
                {/* Overall rating */}
                <View style={styles.overallCard}>
                  <Text style={styles.ratingNumber}>{summary.overallRating.toFixed(1)}</Text>
                  <Text style={styles.starsLarge}>{'⭐'.repeat(Math.round(summary.overallRating))}</Text>
                  <Text style={styles.reviewCount}>{summary.totalReviews} {t('ratings.reviews')}</Text>
                </View>

                {/* Distribution */}
                <View style={styles.distributionCard}>
                  {STARS.map((star) => {
                    const count = summary.ratingDistribution[star] ?? 0;
                    const max = Math.max(...Object.values(summary.ratingDistribution));
                    const width = max > 0 ? (count / max) * 100 : 0;
                    return (
                      <View key={star} style={styles.distRow}>
                        <Text style={styles.distStar}>{star} ⭐</Text>
                        <View style={styles.distBarBg}>
                          <View style={[styles.distBar, { width: `${width}%` }]} />
                        </View>
                        <Text style={styles.distCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Tags */}
                {Object.keys(summary.tagCounts).length > 0 ? (
                  <View style={styles.tagsSection}>
                    <Text style={styles.sectionTitle}>🏷️ Часто упоминают</Text>
                    <View style={styles.tagsRow}>
                      {Object.entries(summary.tagCounts).map(([tag, count]) => (
                        <View key={tag} style={styles.tagBig}>
                          <Text style={styles.tagBigText}>{t(`ratings.tags.${tag}`)}</Text>
                          <Text style={styles.tagCount}>{count}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                <Text style={styles.sectionTitle}>💬 {t('ratings.reviews')}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={styles.emptyText}>{t('ratings.noReviews')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.gray[100] },
  list: { padding: SPACING.base, gap: SPACING.md },
  header: { gap: SPACING.md, marginBottom: SPACING.sm },
  overallCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingNumber: { color: COLORS.white, fontSize: 64, fontWeight: '800' },
  starsLarge: { fontSize: 24 },
  reviewCount: { color: COLORS.gray[400], fontSize: FONTS.sizes.md },
  distributionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  distStar: { width: 40, fontSize: FONTS.sizes.sm, color: COLORS.gray[600] },
  distBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  distBar: { height: '100%', backgroundColor: COLORS.warning, borderRadius: 4 },
  distCount: { width: 24, fontSize: FONTS.sizes.xs, color: COLORS.gray[600], textAlign: 'right' },
  tagsSection: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[800] },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagBig: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  tagBigText: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  tagCount: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  reviewMeta: { flex: 1 },
  reviewName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray[900] },
  reviewDate: { fontSize: FONTS.sizes.xs, color: COLORS.gray[500] },
  reviewRating: { fontSize: 16 },
  reviewComment: { fontSize: FONTS.sizes.md, color: COLORS.gray[700], fontStyle: 'italic' },
  tag: {
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  tagText: { color: COLORS.gray[600], fontSize: FONTS.sizes.xs },
  empty: { alignItems: 'center', padding: SPACING.xxxl },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.gray[600], textAlign: 'center' },
});

export default RatingsScreen;
